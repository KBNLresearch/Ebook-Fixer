import React, { useEffect, useState } from 'react';
import ePub from 'epubjs'
import Viewer from './Viewer';
import EditorControls from './EditorControls';
import styles from './Editor.module.css'
import Annotator from './Annotator'

/**
 * The editor component takes an epub file and displays it as well as a UI for interacting with it.
 * 
 * @param {{ebookFile: The eBook that should be displayed }} props The props of the component
 * @returns The Editor component
 */
function Editor(props) {

    // The id of the div that should contain the viewer
    const viewerId = "epubviewer";

    // The list of images that are currently loaded,
    // used to render the buttons on the left
    const [imageList, setImageList] = useState([])

    // Whether the component is already rendering / rendered the epub,
    // This is a fix for a bug that causes the epub to be rendered twice
    let rendered = false;

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
    function getImagesOnScreen(contents, view) {

        // Maps the replacement blob URLs that epubJS generated to the original filepaths of the images
        const resources = view.book.resources.replacementUrls.map((v, i) =>
        { return { replacementUrl: v, asset: view.book.resources.assets[i] } });

        // Filter that list to only contain images (discard other types)
        const imageResources = resources.filter(resource => {
            return resource.asset.type.startsWith('image')
        })
        // Find all image elements that are loaded in the epub viewer right now
        let elements = contents.document.querySelectorAll('img');

        // Set the image list to a list of objects described in this method's documentation
        setImageList(Array.prototype.map.call(elements, e => {
            // Find the src of the image (blob URL)
            let src = e.src;
            // Find the associated replacement from imageResources
            let resource = imageResources.find(res => {
                return res.replacementUrl === src;
            })
            // If found
            if (resource) {
                // Get the original filename of the image
                let imageFileName = resource.asset.href;
                // If the <img> element doesn't already have an id we can add it
                // But right now that's not needed
                // if (!e.id) {
                //     e.id = imageFileName
                // }

                // Map to the <img> element and the filename
                return { element: e, imageFileName: imageFileName };
            }
        }));
    }

    /**
     * This function is called onload from the FileReader. 
     * It uses epubJS to open the book and display it.
     * Also registers a hook on when the veiwer loads content to execute getImagesOnScreen
     * 
     * @param {ArrayBuffer} e Returned by the FileReader
     */
    function openBook(e) {
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
        if (rendered) return;
        rendered = true;

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
        
        // Display the epubJS render
        rendition.display();

        // Register the hook to process the images 
        // After epubJS finishes loading content (or finishes updating the content)
        rendition.hooks.content.register(getImagesOnScreen)
    }

    /**
     * Creates a hook that executes the arrow func. every time props.ebookFile changes
     * The func sets the reader and reads the file that was passed through props of this component
     */
    useEffect(() => {
        if (window.FileReader) {
            // For reading the file from the input -- DEVELOPMENT ONLY
            let reader;
            reader = new FileReader();
            reader.onload = openBook;
            if (props.ebookFile) reader.readAsArrayBuffer(props.ebookFile);
        }
    }, [props.ebookFile])
    
    return (
        <div>
            <h1 className={styles.title}>Editor</h1>
            <span>If you don't see anything, scroll down to load more of the book.</span>
            <div className={styles.editor}>
                <Viewer id={viewerId}></Viewer>
                <div>
                    <Annotator></Annotator>
                    <EditorControls>{imageList.map(img => {
                        return <button
                            key={img.imageFileName}
                            onClick={() => { img.element.scrollIntoView() }}>
                            Scroll {img.imageFileName} into view
                        </button>
                    })}
                    </EditorControls>
                </div>
            </div>
        </div>
    )
}

export default Editor;