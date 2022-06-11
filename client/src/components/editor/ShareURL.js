import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { ReactComponent as ShareSVG } from '../../assets/svgs/share-icon.svg'
import styles from './ShareURL.module.scss'

/**
 * This component provides a button and popup combo
 * that let the user share the URL to the current book / image
 *
 * @returns The ShareURL component
 * @component
 */
function ShareURL() {
    // Get e-book UUID and imgFilename (which might be undefined) from the URL
    const { uuid, imgFilename } = useParams()

    const [popupVisible, setPopupVisible] = useState(false)
    const [linkType, setLinkType] = useState(imgFilename ? 'image' : 'e-book') // can be either 'e-book' or 'image'
    const urlText = useRef(null)
    const containerRef = useRef(null)

    /**
     * Listens for a mouse click somewhere in the document
     * If it detects one outside the container for the share button & popup then it closes the popup
     *
     * One problem is that if the use clicks on disabled elements, then there is no mousedown event.
     * So if the user clicks on a disabled button outside the popup, it won't be closed.
     * I don't think that's a big problem that really needs solving.
     *
     * @param {Event} e MouseDown Event
     */
    function closePopupOnMouseDownOutside(e) {
        // If the container doesn't contain the element that we clicked on
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            // outside the popup
            setPopupVisible(false)
            // Remove this event listener
            document.removeEventListener(
                'mousedown',
                closePopupOnMouseDownOutside
            )
        }
        // else inside the popup, do nothing
    }

    /**
     * Closes popup if the key detected is Escape
     *
     * @param {Event} e Keydown event
     */
    function closeOnEscapeKey(e) {
        if (e.key === 'Escape') {
            setPopupVisible(false)
            document.removeEventListener('keydown', closeOnEscapeKey)
        }
    }

    /**
     * This function handles the click on the share buttons
     * Shows the popup with the share menu
     *
     * @param {Event} e click event from the share button
     */
    function handleShareClick(e) {
        if (!popupVisible) {
            // Add event listener for a use click, to close the popup
            document.addEventListener('mousedown', closePopupOnMouseDownOutside)
            document.addEventListener('keydown', closeOnEscapeKey)
        }
        // Show popup
        setPopupVisible(!popupVisible)
    }

    /**
     * This function takes a few steps to show the URL that they want to share to the user:
     * - Copies it to the clipboard
     * - Puts it in the readonly input element
     * - Highlights the readonly input element
     * @param {String} url the URL to show
     */
    function showURL(url) {
        navigator.clipboard.writeText(url)
        const urlTextElement = urlText.current
        urlTextElement.value = url
        // Focusing is a bit buggy sometimes so we can do it after a short pause.
        // So that nothing else steals our focus (like the share button)
        setTimeout(() => {
            urlTextElement.focus()
            urlTextElement.select()
        }, 100)
    }

    // Executed every time the link Type changes or popupVisible changes
    useEffect(() => {
        if (popupVisible) {
            // Set URL for ebook
            if (linkType === 'e-book') {
                const url = `${window.location.origin}/ebook/${uuid}`
                showURL(url)
            }
            // Set URL for image
            else if (linkType === 'image') {
                const url = `${
                    window.location.origin
                }/ebook/${uuid}/image/${encodeURIComponent(imgFilename)}`
                showURL(url)
            }
        }
    }, [linkType, popupVisible])

    // If an imgFilename is detected in the URL, we set the default link type to image
    useEffect(() => {
        if (uuid && imgFilename) {
            setLinkType('image')
        } else if (uuid) {
            setLinkType('e-book')
        }
    }, [imgFilename, uuid])

    return (
        <div id="container" className={styles.container} ref={containerRef}>
            <button
                onClick={handleShareClick}
                className={styles.share_button}
                type="button">
                <ShareSVG aria-hidden />
                Share link
            </button>
            <div
                className={
                    styles.popup + ' ' + (popupVisible ? styles.visible : '')
                }>
                <button
                    type="button"
                    title="Close Popup"
                    aria-label="Close Popup"
                    onClick={() => {
                        setPopupVisible(false)
                    }}
                    className={styles.close}>
                    &#10006;
                </button>
                <p>Share link to:</p>
                <div className={styles.tabs}>
                    <button
                        type="button"
                        className={
                            linkType === 'e-book' ? styles.activebtn : ''
                        }
                        onClick={() => {
                            setLinkType('e-book')
                        }}>
                        E-book
                    </button>
                    <button
                        type="button"
                        disabled={imgFilename === undefined}
                        className={linkType === 'image' ? styles.activebtn : ''}
                        onClick={(e) => {
                            if (!e.target.disabled) {
                                setLinkType('image')
                            }
                        }}>
                        Image
                    </button>
                </div>
                <input type="text" readOnly ref={urlText} />
                <p className={styles.copied}>Copied!</p>
            </div>
        </div>
    )
}

export default ShareURL
