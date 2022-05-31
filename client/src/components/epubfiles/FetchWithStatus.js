import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { pollForFile } from '../../api/GetFile'
import styles from './FetchWithStatus.module.scss'

/**
 * The FetchWithStatus component provides a user-friendly UI to fetching an epub file from the server.
 * It can be used after uploading an epub, or when accessing a link to it.
 * It will show the server's progress in processing the file, and any errors the server encounters.
 *
 * @param {String} fileId The id of the file to fetch
 * @param {external:SetStateAction} setEbookFile Sets the current e-book file
 * @component
 * @returns The FetchWithStatus component, ready for rendering.
 */
function FetchWithStatus({ fileId, setEbookFile }) {
    const [messages, setMessages] = useState(<p />)

    function addMessage(msg) {
        const message = <p key={messages.length}>{msg.toString()}</p>
        setMessages(message)
    }

    useEffect(() => {
        if (fileId) {
            const result = pollForFile(fileId, addMessage)
            result
                .then((file) => {
                    addMessage('File Received.')
                    setEbookFile(file)
                })
                .catch((err) => {
                    if (err.cause === 404) {
                        addMessage('Ebook not found')
                    }
                })
        }
    }, [fileId])

    return (
        <div className={styles.container}>
            <div className={styles.loader} />
            <div>{messages}</div>
        </div>
    )
}

FetchWithStatus.propTypes = {
    fileId: PropTypes.string.isRequired,
    setEbookFile: PropTypes.func.isRequired,
}

export default FetchWithStatus
