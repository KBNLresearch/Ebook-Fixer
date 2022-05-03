import React, {useEffect, useRef, useState} from 'react';
import { sendFile } from '../api/SendFile';
import styles from './FileUpload.module.css';

// Tests that drag and drop features and File reading are available
// in the user's browser. Will use a workaround if they're not.
function testForDragAndDropSupport() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
        && 'FormData' in window && 'FileReader' in window;
}

let droppedFile = null;

function FileUpload() {    

    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filename, setFilename] = useState("");

    const form = useRef(null);

    function handleDragEnter(e) {
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragging(true);
        }
    }

    function handleDragLeave(e) {
        setDragging(false);
    }

    function handleDrop(e) {
        droppedFile = e.dataTransfer.files;
        setFilename(droppedFile[0].name)
        console.log(droppedFile);
    }

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();  
    }

    // This executes when the component is mounted:
    useEffect(() => {
        if (testForDragAndDropSupport()) {
            const formElement = form.current;
            // Add Events (react only supports adding 1 event at a time so I had to do it this way)
            ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(s => {
                formElement.addEventListener(s, handleDrag);
            });
            ['dragover', 'dragenter'].forEach(s => {
                formElement.addEventListener(s, handleDragEnter);
            });
            ['dragenter', 'dragleave', 'drop'].forEach(s => {
                formElement.addEventListener(s, handleDragLeave);
            });
            formElement.addEventListener('drop', handleDrop);

            // Cleans up by removing the event listeners
            return function cleanup() {
                ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(s => {
                    formElement.removeEventListener(s, handleDrag);
                });
                ['dragover', 'dragenter'].forEach(s => {
                    formElement.removeEventListener(s, handleDragEnter);
                });
                ['dragenter', 'dragleave', 'drop'].forEach(s => {
                    formElement.removeEventListener(s, handleDragLeave);
                });
                formElement.removeEventListener('drop', handleDrop);
            };
        }
    }, [])

    function handleSubmit(e) {
        e.preventDefault();
        if (uploading) return false;

        if (droppedFile) {
            setUploading(true);
            console.log("uploading");
            console.log(droppedFile);
            // sending the file:
            let formdata = new FormData();
            formdata.append('epub', droppedFile[0])
            sendFile(formdata)
        }

    }

    return (
        <form className={styles.box + ' ' + (testForDragAndDropSupport() ? styles.advanced_upload : '') + ' ' + (dragging ? styles.dragging : '')}
            method="post" encType="multipart/form-data" ref={form}
        onSubmit={handleSubmit}>
            <div className={styles.input + ' ' + (uploading ? styles.hidden : '')}>
                <input className={styles.file} type="file" name="epub" id="file" onChange={(e) => {
                    droppedFile = e.target.files
                    setFilename(droppedFile[0].name)
                }}/>
                <label htmlFor="file">{filename === "" ?
                    <div><strong>Choose a file</strong><span className={styles.dragndrop}> or drag it here</span></div> :
                    <span>{filename}</span>}
                </label>
                <button className={styles.button + ' ' + (uploading ? styles.hidden : '')} type="submit">Upload</button>
            </div>
            <div className={(uploading ? '' : styles.hidden)}>Uploading…</div>
            <div className={styles.success}>Done!</div>
            <div className={styles.error}>Error! <span></span>.</div>
        </form>
    )
}

export default FileUpload;