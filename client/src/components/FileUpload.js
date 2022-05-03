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

// The file that the user will upload
let droppedFile = null;

function FileUpload() {    

    // State of this component:
    // If the user is dragging a file across the component
    const [dragging, setDragging] = useState(false);
    // If the user is uploading a file
    const [uploading, setUploading] = useState(false);
    // The filename of the file that the user is uploading
    const [filename, setFilename] = useState("");
    // Status when the user uploads a file
    const [status, setStatus] = useState("");

    const form = useRef(null);

    // When the mouse enters the file drop area
    function handleDragEnter(e) {
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragging(true);
        }
    }

    // When the mouse leaves the file drop area
    function handleDragLeave(e) {
        setDragging(false);
    }

    // When the mouse drops the file
    function handleDrop(e) {
        droppedFile = e.dataTransfer.files;
        setFilename(droppedFile[0].name)
    }

    // When the mouse is in the drag and drop area
    function handleDrag(e) {
        // prevent browser from opening the file
        e.preventDefault();
        e.stopPropagation();  
    }

    // This executes when the component is mounted:
    useEffect(() => {
        if (testForDragAndDropSupport()) {
            // get form element
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

    // Handle the submission of the file
    function handleSubmit(e) {
        // Dont reload the page with the form
        e.preventDefault();

        // Already submitted
        if (uploading) return false;

        // If the file exists
        if (droppedFile) {
            setUploading(true);
            console.log("uploading");
            console.log(droppedFile);
            // sending the file:
            let formdata = new FormData();
            formdata.append('epub', droppedFile[0])
            sendFile(formdata)
                .then(result => {
                    setUploading(false);
                    setStatus("success");
                })
                .catch(error => {
                    setUploading(false);
                    setStatus("error");
                })
        }
    }

    return (
        <form className={
            (testForDragAndDropSupport() ? styles.advanced_upload : '')
            + ' ' + (dragging ? styles.dragging : '')
            + ' ' + (status === "error" ? styles.error : '')
            + ' ' + (status === "success" ? styles.success : '')
            + styles.box
        }
            method="post" encType="multipart/form-data" ref={form}
            onSubmit={handleSubmit}>
            
            <div className={styles.input + ' ' + (uploading ? styles.hidden : '')}>

                <input className={styles.file}
                    type="file" name="epub" id="file"
                    onChange={(e) => {
                    droppedFile = e.target.files
                    setFilename(droppedFile[0].name)
                    }}
                />

                <label htmlFor="file">
                    {/* If the filename is not empty, display it. 
                    Otherwise, display file choosing prompt*/}
                    {filename === "" ?
                        <div><strong>Choose a file</strong><span className={styles.dragndrop}> or drag it here</span></div>
                        : <span>{filename}</span>
                    }
                </label>

                <button
                    className={styles.button + ' ' + (uploading ? styles.hidden : '')}
                    type="submit">
                    Upload
                </button>
            </div>

            <div className={(uploading ? '' : styles.hidden)}>Uploading…</div>
            <div className={(status === "success" ? styles.success : styles.hidden)}>Done!</div>
            <div className={(status === "error" ? styles.error : styles.hidden)}>Error! Please try again!</div>
        </form>
    )
}

export default FileUpload;