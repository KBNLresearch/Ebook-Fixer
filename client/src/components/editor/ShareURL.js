import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import styles from './ShareURL.module.scss'

function ShareURL() {
    const { uuid, imgFilename } = useParams()

    const [popupVisible, setPopupVisible] = useState(false)
    const [linkType, setLinkType] = useState(imgFilename ? 'image' : 'e-book') // can be either epub of image
    const urlText = useRef(null)

    /**
     * This function handles the click on the share button by copying the current url
     * and showing a message in the button itself for 3 seconds
     *
     * @param {Event} e click event from the share button
     */
    function handleShareClick(e) {
        if (popupVisible) {
            setPopupVisible(false)
        } else {
            setPopupVisible(true)
        }
    }

    /**
     * This fires every time the
     * @param {Event} event
     */
    function handlePopupBlur(event) {
        console.log(event.relatedTarget)
        // if the blur was because of outside focus
        // currentTarget.parentElement is the parent element (the container), relatedTarget is the clicked element
        if (!event.currentTarget.parentElement.contains(event.relatedTarget)) {
            console.log(event.currentTarget.parentElement)
            setPopupVisible(false)
        }
    }

    function showURL(url) {
        navigator.clipboard.writeText(url)
        const urlTextElement = urlText.current
        urlTextElement.value = url
        setTimeout(() => {
            urlTextElement.focus()
            urlTextElement.select()
        }, 100)
    }

    useEffect(() => {
        if (popupVisible) {
            if (linkType === 'e-book') {
                const url = `${window.location.origin}/ebook/${uuid}`
                showURL(url)
            } else if (linkType === 'image') {
                const url = `${
                    window.location.origin
                }/ebook/${uuid}/image/${encodeURIComponent(imgFilename)}`
                showURL(url)
            }
        }
    }, [linkType, popupVisible])

    useEffect(() => {
        if (imgFilename) {
            setLinkType('image')
        }
    }, [imgFilename])

    return (
        <div id="container" className={styles.container}>
            <button
                onClick={handleShareClick}
                className={styles.share_button}
                type="button">
                Share link
            </button>
            <div
                className={
                    styles.popup + ' ' + (popupVisible ? styles.visible : '')
                }
                onBlur={handlePopupBlur}>
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
