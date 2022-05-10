import React, { useState } from 'react';

/**
 * The controls for the editor
 * Right now these are a bunch of buttons that scroll pictures from the book into view
 * These are passed as children via props
 * 
 * @param {{imageList: the list of images currently loaded,
 *          onNext: function for what happens when the next button is pressed
 *          onPrev: function for what happens when the next button is pressed
 *          rendition: the render object from epubJS }} props The props of this component
 * @returns The EditorControls component
 */
function EditorControls(props) {

    const [currentImage, setCurrentImage] = useState(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(-1);

    async function prevImage() {
        let newImage = await props.onPrev(currentImageIndex, props.imageList, props.rendition);
        newImage.scrollIntoView();
        setCurrentImageIndex(currentImageIndex - 1)
    }

    async function nextImage() {
        let newImage = await props.onNext(currentImageIndex, props.imageList, props.rendition);
        newImage.scrollIntoView();
        setCurrentImageIndex(currentImageIndex + 1)
    }

    return (
        <div>
            {currentImageIndex < 1 ? '' : <button onClick={prevImage}>Previous Image</button>}
            {currentImageIndex < props.imageList.length - 1 ? <button onClick={nextImage}>
                {currentImageIndex === -1 ? 'Begin' : 'Next Image'}
            </button> : ''}
        </div>
    )
}

export default EditorControls;