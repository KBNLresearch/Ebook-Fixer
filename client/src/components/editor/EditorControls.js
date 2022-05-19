import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { highlightElement, ImageInfo } from '../../helpers/EditorHelper'
import styles from './Editor.module.scss'

/**
 * The controls for the editor
 * Right now these are a bunch of buttons that scroll pictures from the book into view
 * These are passed as children via props
 *
 * @param {{imageList: the list of images currently loaded,
 *          getImage: function that retrieves the image element from the rendition with the index and imagelist provided
 *          rendition: the render object from epubJS
 *          setCurrentImage: funciton for setting the image that is currently being annotated}} props The props of this component
 * @returns The EditorControls component
 */
function EditorControls({ imageList, getImage, rendition, setCurrentImage }) {
    // The index of the image currently being displayed
    const [currentImageIndex, setCurrentImageIndex] = useState(-1)

    const [nextDisabled, setNextDisabled] = useState(false)
    const [prevDisabled, setPrevDisabled] = useState(true)

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
        if (nextIndex() === imageList.length - 1) {
            // at end
            setNextDisabled(true)
        } else if (nextIndex() > 0) {
            setPrevDisabled(false)
        }
    }

    function handlePrev(e) {
        changeToImageIndex(prevIndex())
        if (prevIndex() === 0) {
            // at start
            setPrevDisabled(true)
        } else {
            setNextDisabled(false)
        }
    }

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
