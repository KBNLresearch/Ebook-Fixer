import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useParams } from 'react-router-dom'
import { highlightElement, ImageInfo } from '../../helpers/EditorHelper'
import styles from './Editor.module.scss'
import { getImgFilename } from '../../helpers/EditImageHelper'

/**
 * The controls for the editor
 * Right now these are a bunch of buttons that scroll pictures from the book into view
 * These are passed as children via props
 *
 * @param {{imageList: List of Images}} props currently loaded images
 * @param {{getImage: Function}} props  retrieves the image element from the rendition with the index and imagelist provided
 * @param {{rendition: Render object from ePubJS}} props
 * @param {{setCurrentImage: SetStateAction}} props function for setting the image that is currently being annotated
 * @returns The EditorControls component
 */
function EditorControls({ imageList, getImage, rendition, setCurrentImage }) {
    // The index of the image currently being displayed
    const [currentImageIndex, setCurrentImageIndex] = useState(-1)

    const [nextDisabled, setNextDisabled] = useState(false)
    const [prevDisabled, setPrevDisabled] = useState(true)

    const navigate = useNavigate()

    // Get the Image filename from the url
    const { imgFilename } = useParams()

    // When the imageList is instantiated / filled up (only happens at the beginning)
    useEffect(() => {
        if (
            imgFilename &&
            currentImageIndex === -1 &&
            rendition &&
            imageList.length > 0
        ) {
            // Get the filename in a decoded format
            const imageFilenameDecoded = decodeURIComponent(imgFilename)
            // Find the index of the image in imageList
            const foundIndex = imageList.findIndex(
                (imageInfo) => imageInfo.asset.href === imageFilenameDecoded
            )
            // If found
            if (foundIndex > -1) {
                changeToImageIndex(foundIndex)
            } else {
                // Alert the user that this link doesn't point to an image
                alert("The image with that name wasn't found in this book!")
            }
        } else if (!imgFilename && currentImageIndex > -1) {
            setCurrentImageIndex(-1)
            setCurrentImage(null)
        }
    }, [imageList, imgFilename])

    // Gets the next index
    function nextIndex() {
        return Math.min(currentImageIndex + 1, imageList.length - 1)
    }

    // Gets the previous index
    function prevIndex() {
        return Math.max(currentImageIndex - 1, 0)
    }

    function handleNext(e) {
        changeToImageIndex(nextIndex())
    }

    function handlePrev(e) {
        changeToImageIndex(prevIndex())
    }

    /**
     * This function handles enabling and disabling the buttons for navigating between images.
     * When at the first image, disables the Previous image button
     * When at the last image, disables the Next image button
     */
    function disableEnableNavButtons() {
        if (currentImageIndex <= 0) {
            setPrevDisabled(true)
        } else {
            setPrevDisabled(false)
        }
        if (currentImageIndex === imageList.length - 1) {
            setNextDisabled(true)
        } else {
            setNextDisabled(false)
        }
    }

    // Each time the index changes see if the navigation buttons need to be disabled
    useEffect(disableEnableNavButtons, [currentImageIndex, imageList.length])

    /**
     * An asynchronous function to change the view of the book
     * to the image new index given by newIndex.
     *
     * @param {Integer} newIndex The new Index of the image to switch to
     */
    async function changeToImageIndex(newIndex) {
        // Get the image
        const newImage = await getImage(imageList[newIndex], rendition)
        // Scroll to the image
        newImage.scrollIntoView()
        // Highlight the image in red for 5s
        highlightElement(newImage)
        // Set the URL to be of that Image
        navigate(
            'image/' + encodeURIComponent(getImgFilename(imageList[newIndex]))
        )
        // Set the current image via the props from the parent
        setCurrentImage(imageList[newIndex])
        // Change the current index
        setCurrentImageIndex(newIndex)
    }

    return (
        <div className={styles.editor_controls}>
            <button
                type="button"
                disabled={prevDisabled}
                className={styles.navigation_button}
                onClick={handlePrev}>
                Previous Image
            </button>
            <button
                type="button"
                disabled={nextDisabled}
                className={styles.navigation_button}
                onClick={handleNext}>
                {currentImageIndex === -1
                    ? 'Begin Annotating the First Image'
                    : 'Next Image'}
            </button>
        </div>
    )
}

EditorControls.propTypes = {
    imageList: PropTypes.arrayOf(PropTypes.instanceOf(ImageInfo)).isRequired,
    getImage: PropTypes.func.isRequired,
    rendition: PropTypes.shape({}).isRequired,
    setCurrentImage: PropTypes.func.isRequired,
}

export default EditorControls
