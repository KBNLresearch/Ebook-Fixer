import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import {
    getImageFromRendition,
    openBook,
    viewerId,
} from '../../helpers/EditorHelper'
import Annotator from './Annotator'
import styles from './Editor.module.scss'
import EditorControls from './EditorControls'
import Viewer from './Viewer'
import FileDownload from '../FileDownload'
import { getFileBlob } from '../../api/GetFile'
import ShareURL from './ShareURL'

/**
 * The editor component takes an epub file and displays it as well as a UI for interacting with it.
 *
 * @param {{ebookFile: The eBook that should be displayed }} props The props of the component
 * @param {{ebookId: The UUID for the ebook generated by server}} props The props of the component
 * @returns The Editor component
 */
function Editor({ ebookFile, ebookId }) {
    // The list of images that are currently loaded,
    // used to render the buttons on the left
    const [imageList, setImageList] = useState([])
    const [currentImage, setCurrentImage] = useState(null)
    const [rendition, setRendition] = useState(null)
    const [ebookNotFound, setEbookNotFound] = useState(false)

    const { uuid } = useParams()

    // Whether the component is already rendering / rendered the epub,
    // This is a fix for a bug that causes the epub to be rendered twice
    let rendered = false
    function setRendered(newVal) {
        rendered = newVal
    }
    function getRendered() {
        return rendered
    }

    /**
     * This function is used to gather the uuid from the source, wherever that may be.
     * If the prop to this component is set, then it takes it from there, otherwise the one from the url is used.
     *
     * @returns The uuid of the e-book that is currently being edited
     */
    function getEbookUUID() {
        if (!ebookId) {
            return uuid
        }
        return ebookId
    }

    /**
     * Executed when ebookFile changes
     * The readFile func sets the reader and reads the file that was passed through props of this component
     * Or if it wasn't fetches it from the server
     */
    useEffect(() => {
        const readFile = (file) => {
            if (window.FileReader) {
                // For reading the file from the input
                const reader = new FileReader()
                reader.onload = (e) => {
                    openBook(
                        e,
                        getRendered,
                        setRendered,
                        setImageList,
                        setRendition
                    )
                }
                if (file) reader.readAsArrayBuffer(file)
            }
        }

        if (ebookFile === null) {
            getFileBlob(getEbookUUID())
                .then((blob) => {
                    setEbookNotFound(false)
                    readFile(blob)
                })
                .catch((error) => {
                    setEbookNotFound(true)
                })
        } else {
            readFile(ebookFile)
        }
    }, [ebookFile])

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Editor</h1>
            {ebookNotFound ? (
                <span style={{ color: 'red' }}>E-book not found!</span>
            ) : (
                <div>
                    <span>Scroll down to load the e-book</span>
                    <ShareURL />
                </div>
            )}

            <div className={styles.editor}>
                <div className={styles.viewer_container}>
                    <EditorControls
                        rendition={rendition}
                        imageList={imageList}
                        getImage={getImageFromRendition}
                        setCurrentImage={setCurrentImage}
                    />
                    <Viewer id={viewerId} />
                </div>
                <div className={styles.annotator_container}>
                    <Annotator
                        currImage={currentImage}
                        ebookId={getEbookUUID()}
                    />
                    <FileDownload ebookId={getEbookUUID()} />
                </div>
            </div>
        </div>
    )
}

Editor.propTypes = {
    ebookFile: PropTypes.shape({}),
    ebookId: PropTypes.string,
}

Editor.defaultProps = {
    ebookId: '',
    ebookFile: null,
}

export default Editor
