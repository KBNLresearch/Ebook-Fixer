import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './Sidebar.module.scss'
import { ReactComponent as LogoSVG } from '../assets/svgs/logo.svg'
import { ReactComponent as MenuSVG } from '../assets/svgs/menu-icon.svg'
import { ReactComponent as GoBackArrowSVG } from '../assets/svgs/go-back-arrow.svg'
import FileDownload from './epubfiles/FileDownload'

/**
 * This component creates an expandable sidebar which is used for navigation
 * and accessing extra functionality (e.g. exporting epubs) in our app.
 * it aso links to external resources, like the W3C annotation guidelines and
 * our github and developer docs.
 *
 * @param {bool} download Whether the user can download an ebook
 * @param {bool} imageSelected Whether the user selected an image
 * @component
 * @returns
 */
function Sidebar({ download, imageSelected }) {
    const { uuid, imgFilename } = useParams()

    const [sidebarVisible, setSidebarVisible] = useState(false)

    const containerRef = useRef(null)

    /**
     * Listens for a mouse click somewhere in the document
     * If it detects one outside the container for the share button & popup then it closes the popup
     *
     * One problem is that if the use clicks on disabled elements, then there is no mousedown event.
     * So if the user clicks on a disabled button outside the sidebar, it won't be closed.
     * I don't think that's a big problem that really needs solving.
     *
     * @param {Event} e MouseDown Event
     */
    function closePopupOnMouseDownOutside(e) {
        // If the container doesn't contain the element that we clicked on
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            // outside the popup
            setSidebarVisible(false)
            // Remove this event listener
            document.removeEventListener(
                'mousedown',
                closePopupOnMouseDownOutside
            )
        }
        // else inside the popup, do nothing
    }

    useEffect(() => {
        if (sidebarVisible) {
            document.addEventListener('mousedown', closePopupOnMouseDownOutside)
        } else {
            document.removeEventListener(
                'mousedown',
                closePopupOnMouseDownOutside
            )
        }
    })

    return (
        <div ref={containerRef}>
            <div className={styles.menu}>
                <button
                    type="button"
                    onClick={() => {
                        setSidebarVisible(true)
                    }}>
                    <div className={styles.bars} aria-hidden>
                        <MenuSVG />
                    </div>
                    Menu
                </button>
            </div>

            <div
                className={
                    styles.sidebar +
                    ' ' +
                    (sidebarVisible ? styles.sidebarVisible : '')
                }>
                <button
                    type="button"
                    title="Close Sidebar"
                    aria-label="Close Sidebar"
                    onClick={() => {
                        setSidebarVisible(false)
                    }}
                    className={styles.close}>
                    &#10006;
                </button>
                <div className={styles.heading}>
                    <Link to="/" className={styles.logo}>
                        <LogoSVG aria-hidden />
                        E-book Fixer
                    </Link>
                </div>
                <div className={styles.content}>
                    {imgFilename && uuid && imageSelected && download ? (
                        <Link
                            to={`/ebook/${uuid}`}
                            onClick={() => {
                                setSidebarVisible(false)
                            }}>
                            <GoBackArrowSVG /> Back to Overview
                        </Link>
                    ) : (
                        ''
                    )}
                    <a
                        href="https://www.w3.org/WAI/tutorials/images/decision-tree/"
                        target="_blank"
                        rel="noreferrer">
                        W3C Annotation Guide
                    </a>
                </div>
                <div className={styles.footer}>
                    {uuid && download ? (
                        <div className={styles.download}>
                            <FileDownload ebookId={uuid} />
                        </div>
                    ) : (
                        ''
                    )}
                    <a
                        href="https://github.com/Revirator/Ebook-Fixer"
                        target="_blank"
                        rel="noreferrer">
                        Github
                    </a>
                    <a
                        href="https://revirator.github.io/Ebook-Fixer/"
                        target="_blank"
                        rel="noreferrer">
                        Developer Docs
                    </a>
                </div>
            </div>
        </div>
    )
}

Sidebar.defaultProps = {
    download: false,
    imageSelected: false,
}

Sidebar.propTypes = {
    download: PropTypes.bool,
    imageSelected: PropTypes.bool,
}

export default Sidebar
