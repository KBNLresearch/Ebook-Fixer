import React, { useEffect, useState } from 'react';
import Viewer from './Viewer';
import EditorControls from './EditorControls';
import styles from './Editor.module.css'
import Annotator from './Annotator'
import {viewerId, openBook, getImageFromRendition } from '../../helpers/EditorHelper'

/**
 * The editor component takes an epub file and displays it as well as a UI for interacting with it.
 * 
 * @param {{ebookFile: The eBook that should be displayed }} props The props of the component
 * @returns The Editor component
 */
function Editor(props) {

    // The list of images that are currently loaded,
    // used to render the buttons on the left
    const [imageList, setImageList] = useState([]);
    const [currentImage, setCurrentImage] = useState(null);
    const [rendition, setRendition] = useState(null);

    // Whether the component is already rendering / rendered the epub,
    // This is a fix for a bug that causes the epub to be rendered twice
    let rendered = false;
    function setRendered(newVal) { rendered = newVal };
    function getRendered() { return rendered };

    /**
     * Creates a hook that executes the arrow func. every time props.ebookFile changes
     * The func sets the reader and reads the file that was passed through props of this component
     */
    useEffect(() => {
        if (window.FileReader) {
            // For reading the file from the input -- DEVELOPMENT ONLY
            let reader;
            reader = new FileReader();
            reader.onload = (e) => {openBook(e, getRendered, setRendered, setImageList, setRendition) };
            if (props.ebookFile) reader.readAsArrayBuffer(props.ebookFile);
        }
    }, [props.ebookFile])
    
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Editor</h1>
            <span>If you don't see anything, scroll down to load more of the book.</span>
            <div className={styles.editor}>
                <div>
                    <EditorControls rendition={rendition} imageList={imageList} getImage={getImageFromRendition} setCurrentImage={setCurrentImage} />
                    <Viewer id={viewerId}></Viewer>
                </div>
                <div>
                    <Annotator currentImage={currentImage}></Annotator>
                </div>
            </div>
        </div>
    )
}

export default Editor;