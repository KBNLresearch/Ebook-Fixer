import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { interpretServerMessage, pollForFile } from '../../api/GetFile'
import styles from './FetchWithStatus.module.scss'

/**
 * The FetchWithStatus component provides a user-friendly UI to fetching an epub file from the server.
 * It can be used after uploading an epub, or when accessing a link to it.
 * It will show the server's progress in processing the file, and any errors the server encounters.
 *
 * @param {String} fileId The id of the file to fetch
 * @param {external:SetStateAction} setEbookFile Sets the current e-book file
 * @param {Function} onError handler for errors that occur during fetching of the ebook file
 * @component
 * @returns The FetchWithStatus component, ready for rendering.
 */
function FetchWithStatus({ fileId, setEbookFile, onError }) {
    const [messages, setMessages] = useState(<p />)
    const [stopped, setStopped] = useState(false)
    const msgArray = []

    const messagesRef = useRef(null)

    // Stores & Displays messages to the user in the space below the loader
    function addMessage(message) {
        const msg = message.toString()
        // Store message if it isn't the same
        if (msgArray[msgArray.length - 1] !== msg) {
            msgArray.push(msg)
        }
        // Get latest 3
        const last3 = msgArray.slice(-3).reverse()
        const messageElements = last3.map((e, i) => (
            <p
                key={`msg${e}${msgArray.length - i}`}
                style={{ opacity: 1 - i / last3.length }}>
                {e}
            </p>
        ))

        // Add fade animation so that the displaying isn't too jarring
        messagesRef.current.classList.add(styles.update_messages)
        setTimeout(() => {
            setMessages(messageElements)
            messagesRef.current.classList.remove(styles.update_messages)
        }, 200)
    }

    // When the fileId is set, so when the component is initiated
    useEffect(() => {
        if (fileId) {
            // Poll for file
            const result = pollForFile(fileId, addMessage)
            // Once polling finishes
            result
                .then((file) => {
                    // Successfully get ePub
                    addMessage('File Received.')
                    setEbookFile(file)
                })
                .catch((err) => {
                    if (err.statusCode === 404) {
                        addMessage('E-book cannot be found on the server')
                    } else if (err.statusCode === 403) {
                        // Problem with the ebook
                        err.json.then((json) => {
                            console.log(json)
                            if (json.state)
                                addMessage(interpretServerMessage(json))
                        })
                    }
                    onError(err)
                })
                .finally(() => {
                    // Hide spinner / loader
                    setStopped(true)
                })
        }
    }, [fileId])

    return (
        <div className={styles.container}>
            <div
                className={
                    styles.loader + ' ' + (stopped ? styles.invisible : '')
                }
                aria-hidden="true"
            />
            <div className={styles.messages} ref={messagesRef}>
                {messages}
            </div>
        </div>
    )
}

FetchWithStatus.propTypes = {
    fileId: PropTypes.string.isRequired,
    setEbookFile: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
}

export default FetchWithStatus
