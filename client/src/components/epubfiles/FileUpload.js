import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { sendFile } from '../../api/SendFile'
import styles from './FileUpload.module.css'
import { ReactComponent as UploadSVG } from '../../assets/svgs/upload-sign.svg'
import FetchWithStatus from './FetchWithStatus'

// Tests that drag and drop features and File reading are available
// in the user's browser. The code will use a workaround if they're not.
function testForDragAndDropSupport() {
    const div = document.createElement('div')
    return (
        ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
        'FormData' in window &&
        'FileReader' in window
    )
}

// This helper function checks that the file type of the file provided is an epub
function checkFileType(file) {
    return file.type === 'application/epub+zip'
}

// The file that the user will upload
let droppedFile = null

/**
 * The FileUpload handles uploading the epub and sending it to the server.
 * It supports both drag and drop and choosing a file with a system window.
 * It checks the file type to be an epub.
 * @param {SetStateAction} setEbookFile Updates the current e-book file
 * @param {SetStateAction} setEbookIds Updates the current e-book id
 * @param {SetStateAction} setEbookTitle Updates the current e-book title
 * @component
 * @returns The FileUpload component, ready for rendering.
 */
function FileUpload({ setEbookFile, setEbookId, setEbookTitle }) {
    // State of this component:
    // If the user is dragging a file across the component
    const [dragging, setDragging] = useState(false)
    // If the user is uploading a file
    const [uploading, setUploading] = useState(false)
    // The filename of the file that the user is uploading
    const [filename, setFilename] = useState('')
    // Status when the user uploads a file
    const [status, setStatus] = useState('')
    // File id from uploading
    const [fileId, setFileId] = useState('')

    // A reference to the form that is returned below,
    // Used for adding event listeners to it.
    const form = useRef(null)

    // For navigation to the editor
    const navigate = useNavigate()

    // When the mouse enters the file drop area
    function handleDragEnter(e) {
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragging(true)
        }
    }

    // When the mouse leaves the file drop area
    function handleDragLeave(e) {
        setDragging(false)
    }

    // When the mouse drops the file
    function handleDrop(e) {
        droppedFile = e.dataTransfer.files
        setFilename(droppedFile[0].name)
    }

    // When the mouse is in the drag and drop area
    function handleDrag(e) {
        // prevent browser from opening the file
        e.preventDefault()
        e.stopPropagation()
    }

    // This executes when the component is mounted:
    // This is used for adding event listeners for dragging and dropping (for UI elements)
    useEffect(() => {
        if (testForDragAndDropSupport()) {
            // get form element
            const formElement = form.current
            // Add Events (react only supports adding 1 event at a time so I had to do it this way)
            ;[
                'drag',
                'dragstart',
                'dragend',
                'dragover',
                'dragenter',
                'dragleave',
                'drop',
            ].forEach((s) => {
                formElement.addEventListener(s, handleDrag)
            })
            ;['dragover', 'dragenter'].forEach((s) => {
                formElement.addEventListener(s, handleDragEnter)
            })
            ;['dragenter', 'dragleave', 'drop'].forEach((s) => {
                formElement.addEventListener(s, handleDragLeave)
            })
            formElement.addEventListener('drop', handleDrop)

            // Cleans up by removing the event listeners
            return function cleanup() {
                ;[
                    'drag',
                    'dragstart',
                    'dragend',
                    'dragover',
                    'dragenter',
                    'dragleave',
                    'drop',
                ].forEach((s) => {
                    formElement.removeEventListener(s, handleDrag)
                })
                ;['dragover', 'dragenter'].forEach((s) => {
                    formElement.removeEventListener(s, handleDragEnter)
                })
                ;['dragenter', 'dragleave', 'drop'].forEach((s) => {
                    formElement.removeEventListener(s, handleDragLeave)
                })
                formElement.removeEventListener('drop', handleDrop)
            }
        }
    }, [])

    /**
     * This Function checks that a file has been submitted / dropped
     * and is called automatically when the user submits the form (by clicking the upload button)
     * It checks the file type of the submission (by calling a helper function)
     * And sends the file to the server using the API.
     *
     * @param e The event that submitted the form.
     * @returns False if the submission is not meant to be done at this point, nothing if it succeeds / fails
     */
    function handleSubmit(e) {
        // Dont reload the page with the form
        e.preventDefault()
        setStatus('')

        // Already submitted
        if (uploading) return false

        // If the file exists
        if (droppedFile) {
            // Check the file type:
            if (!checkFileType(droppedFile[0])) {
                // Wrong file type
                setStatus('bad_file_type')
                return false
            }

            setUploading(true)

            // -----------------------------------------------------
            // TODO: Remove the next line of code once the endpoint for downloading ebooks is done
            // this is for development purposes only:
            // Puts the dropped file into the state of the App component to use for the Editor
            if (setEbookFile) {
                setEbookFile(droppedFile[0])
            }
            // -----------------------------------------------------

            // sending the file:
            const formdata = new FormData()
            formdata.append('epub', droppedFile[0])
            sendFile(formdata)
                .then((result) => {
                    if (
                        Object.prototype.hasOwnProperty.call(result, 'book_id')
                    ) {
                        setEbookId(result.book_id)
                        setFileId(result.book_id)
                    }
                    if (Object.prototype.hasOwnProperty.call(result, 'title')) {
                        const { title } = result
                        if (title.length <= 75) {
                            setEbookTitle(title)
                        } else {
                            setEbookTitle(title.slice(0, 72) + '...')
                        }
                    }
                })
                .catch((error) => {
                    setUploading(false)
                    setStatus('error')
                })
        }
    }

    // Return the final HTML of the component:
    return (
        <form
            className={
                styles.box +
                ' ' +
                (testForDragAndDropSupport() ? styles.advanced_upload : '') +
                ' ' +
                (dragging ? styles.dragging : '') +
                ' ' +
                (status === 'error' ? styles.error : '') +
                ' ' +
                (status === 'success' ? styles.success : '')
            }
            method="post"
            encType="multipart/form-data"
            ref={form}
            onSubmit={handleSubmit}>
            <div
                className={
                    styles.input + ' ' + (uploading ? styles.hidden : '')
                }>
                <input
                    className={styles.file}
                    type="file"
                    name="epub"
                    id="file"
                    onChange={(e) => {
                        droppedFile = e.target.files
                        setFilename(droppedFile[0].name)
                    }}
                />

                <label htmlFor="file">
                    {/* If the filename is not empty, display it. 
                    Otherwise, display file choosing prompt */}
                    {filename === '' ? (
                        <div>
                            <strong className={styles.chooseFile}>
                                Choose a file
                            </strong>
                            <span className={styles.dragndrop}>
                                {' '}
                                or drag it here
                            </span>
                        </div>
                    ) : (
                        <span>{filename}</span>
                    )}
                </label>

                <button
                    className={
                        styles.button + ' ' + (uploading ? styles.hidden : '')
                    }
                    type="submit">
                    <UploadSVG className={styles.svg} />
                    Upload
                </button>
            </div>

            <div className={uploading ? '' : styles.hidden}>
                {fileId ? 'Processing file...' : 'Uploading…'}
            </div>
            <div
                className={
                    status === 'success' ? styles.success : styles.hidden
                }>
                Uploaded! Redirecting to editor...
            </div>
            <div className={status === 'error' ? styles.error : styles.hidden}>
                This e-book contains errors, thus cannot be processed by the system... <br />
                Please try another e-book or fix the errors.
            </div>
            <div
                className={
                    status === 'bad_file_type' ? styles.error : styles.hidden
                }>
                The chosen file has the wrong file type!
                <br />
                Please submit an .epub file.
            </div>
            {fileId === '' ? (
                ''
            ) : (
                <FetchWithStatus
                    fileId={fileId}
                    setEbookFile={(file) => {
                        setEbookFile(file)
                        setStatus('success')
                        setTimeout(() => {
                            navigate(`/ebook/${fileId}`)
                        }, 2000)
                    }}
                    onError={(err) => {
                        setStatus('error')
                        setTimeout(() => {
                            setUploading(false)
                            setFilename('')
                            setFileId('')
                        }, 2000)
                    }}
                />
            )}
        </form>
    )
}

FileUpload.propTypes = {
    /**
     * Function to set the epub file once uploaded
     */
    setEbookFile: PropTypes.func.isRequired,
    /**
     * Function to set epub id once received response from server
     */
    setEbookId: PropTypes.func.isRequired,
    /**
     * Function to set epub title
     */
    setEbookTitle: PropTypes.func.isRequired,
}

export default FileUpload
