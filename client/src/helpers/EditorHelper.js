import ePub from 'epubjs'

// The id of the div that should contain the viewer
export const viewerId = "epubviewer";

/**
 * This function is called onload from the FileReader. 
 * It uses epubJS to open the book and display it.
 * Also registers a hook on when the veiwer loads content to execute getImagesOnScreen
 * 
 * @param {ArrayBuffer} e Returned by the FileReader
 * @param {function: () => boolean} getRendered Getter for the rendered variable, to see if the editor is already rendered
 * @param {function: (boolean) => void} setRendered Setter for the rendered variable, to set it to true
 * @param {function: (list of objects) => void} setImageList Setter for the image list state
 */
export function openBook(e, getRendered, setRendered, setImageList, setRendition) {
    // Get the opened book
    var bookData = e.target.result;

    // Initialise epubJS
    let book = ePub();
    let rendition;

    // Open (unzip) the book using epubJS
    book.open(bookData);

    // Reset the veiwer's inner html so that the old epub is gone
    document.getElementById(viewerId).textContent = '';

    // Make sure that only one epub is being rendered at once.
    if (getRendered()) return;
    setRendered(true);

    // Render the epub using the epubJS viewer
    rendition = book.renderTo(viewerId, {
        // Scrolling instead of pages
        flow: "scrolled",
        // Try to load per file, as much of the epub at once as we can
        manager: "continuous",
        // TODO: experiment with the parameters for epubJS, they aren't very well documented
        // layout: "pre-paginated",
        // Take up the whole width of the container
        width: "100%",
        // Use 600 pixels of height for now
        height: 600
    });

    // Get the promise that epubJS will display the start of the book
    let displayed = rendition.display();

    // Process the images after the book has been displayed
    displayed.then(stuff => {
        // After the book has been loaded
        book.loaded.spine.then((spine) => {
            getAllImages(rendition).then(imgs => {
                setImageList(imgs);
            });
        });
    })

    // Save the rendition to state
    setRendition(rendition);
}

/**
 * 
 * @param {EpubJS Rendition: http://epubjs.org/documentation/0.3/#rendition} rendition The rendition that epubJS makes that 
 * @returns 
 */
export async function getAllImages(rendition) {
    // All the different chapters / files in the book (I will call them items)
    let spineItems = rendition.book.spine.spineItems;

    // Map all the items asynchronously 
    let mappedimages = spineItems.map(async item => {
        // Wait for epubJS to load that item
        return await item.load(rendition.book.load.bind(rendition.book))
            .then((contents) => {
            // The item has been loaded, so we can use it
                
            // Get the document from the item 
            //(this isn't the same one that is eventually displayed, cus the image sources have to be replaced with different urls)
            let doc = item.document.documentElement

            // Get all img & image elements from the document
            let imgs = doc.querySelectorAll("img")
            let images = doc.querySelectorAll("image")

            // Concatenate the lists
            let allImages = [...imgs, ...images]
            // Map the images to their {src, section (book item), and element}
            return allImages.map(image => {
                let src;
                if (image.src) { // If it's a normal image
                    //remove root url .replace(/^.*\/\/[^\/]+/, '').substring(1)
                    // Take jut the filename
                    src = String(image.src).split(/(\\|\/)/g).pop();
                } else if (image.href) { // If it's a svg inside an <image> tag 
                    // (i saw that used in the Alice in Wonderland epub)
                    src = image.href.baseVal
                }
                return { element: image, section: item, src: src }
            })
        });
    });

    // Await getting all the images asynchronously and flatten the array 
    // (because there are multiple images per item in the book and multiple items in a book)
    let imageSectionList = await Promise.all(mappedimages).then(arr => arr.flat())

    // Get the resources of the book (from the manifest)
    const resources = rendition.book.resources.replacementUrls.map((v, i) =>
    { return { replacementUrl: v, asset: rendition.book.resources.assets[i] } });

    // Filter that list to only contain images (discard other types)
    const imageResources = resources.filter(resource => {
        return resource.asset.type.startsWith('image')
    })
    
    // Map each resource from the manifest to one of the imageSectionList above.
    let finalImageList = imageResources.map(imgResource => {
        // Find image with the same filename as the one form the resource
        let foundImage = imageSectionList.find(img => {
            return imgResource.asset.href.split(/(\\|\/)/g).pop() === img.src;
        })
        // If found
        if (foundImage) {
            imgResource.section = foundImage.section
            return imgResource;
        }
        // If not found
        return undefined;
    });
    // Filter out images that weren't found 
    // (this happens quite a lot in some books)
    // TODO: Research why some images aren't found!
    // Ideas: The image is a thumbnail, or just unused in the book.
    finalImageList = finalImageList.filter(n => n !== undefined)
    
    return finalImageList;
}

/**
 * This method is a hook for the content of the epubJS viewer, 
 * that means when epubJS loads (more) content from the eBook, this is executed.
 * 
 * This sets the imageList state to be a list of objects like:
 * {
 *  element: <img> element from the book,
 *  imageFileName: the filename of the image inside the epub
 * }
 * 
 * It does that by accessing the files loaded by epubJS, 
 * finding the blob URLs it generated for each image file, 
 * finding image elements inside the DOM of the rendered epub,
 * and matching them to the original filenames.
 * 
 * @param {http://epubjs.org/documentation/0.3/#contents} contents Handles DOM manipulation, for epubJS
 * @param {{book: The Book loaded in by epubJS}} view Contains information about the epub that was loaded by epubJS
 */
// export function getImagesOnScreen(contents, view, setImageList) {

//     // Maps the replacement blob URLs that epubJS generated to the original filepaths of the images
//     const resources = view.book.resources.replacementUrls.map((v, i) =>
//     { return { replacementUrl: v, asset: view.book.resources.assets[i] } });

//     // Filter that list to only contain images (discard other types)
//     const imageResources = resources.filter(resource => {
//         return resource.asset.type.startsWith('image')
//     })
//     // Find all image elements that are loaded in the epub viewer right now
//     let elements = contents.document.querySelectorAll('img');

//     // Set the image list to a list of objects described in this method's documentation
//     setImageList(Array.prototype.map.call(elements, e => {
//         // Find the src of the image (blob URL)
//         let src = e.src;
//         // Find the associated replacement from imageResources
//         let resource = imageResources.find(res => {
//             return res.replacementUrl === src;
//         })
//         // If found
//         if (resource) {
//             // Get the original filename of the image
//             let imageFileName = resource.asset.href;
//             // If the <img> element doesn't already have an id we can add it
//             // But right now that's not needed
//             // if (!e.id) {
//             //     e.id = imageFileName
//             // }

//             // Map to the <img> element and the filename
//             return { element: e, imageFileName: imageFileName };
//         }
//     }));
// }

function findImageInDocument(contents, imageToFind) {
    let imgs = contents.querySelectorAll("img")
    let images = contents.querySelectorAll("image")

    let allImages = [...imgs, ...images]

    let foundImage = allImages.find(img => {
        if (img.src) {
            return img.src === imageToFind.replacementUrl;
        } else if (img.href) {
            return img.href.baseVal === imageToFind.replacementUrl
        }
        return false;
    })

    if (foundImage) {
        console.log(foundImage);
        return foundImage;
    }
}

export function nextImage(currentImageIndex, imageList, rendition) {
    console.log(currentImageIndex);
    let index = currentImageIndex;

    let imagetobeDisplayed = imageList[index + 1]
    console.log(imagetobeDisplayed);

    let displayed = rendition.display(imagetobeDisplayed.section.href)
    
    return displayed.then(sec => {

        let contents = rendition.getContents();
        for (let doc of contents) {
            let found = findImageInDocument(doc.document, imagetobeDisplayed);
            if (found) {
                return found;
            }
        }
        return null;
    })
}

export function prevImage(currentImageIndex, imageList, rendition) {
    console.log(currentImageIndex);
    let index = currentImageIndex;

    let imagetobeDisplayed = imageList[index-1]

    let displayed = rendition.display(imagetobeDisplayed.section.href)
    
    return displayed.then(sec => {

        let contents = rendition.getContents();
        for (let doc of contents) {
            let found = findImageInDocument(doc.document, imagetobeDisplayed);
            if (found) {
                return found;
            }
        }
        return null;
    })
}