import PropTypes from 'prop-types'
import styles from './EpubInfoPage.module.scss'

/**
 * The EpubInfoPage component contains information about our website and epubs in general
 *
 * @returns The EpubInfoPage component
 */
function EpubInfoPage({}) {
    return (
        <div className={styles.container}>
            <div className={styles.infobox}>
                <h1>Let&apos;s make e-books accessible to all!</h1>
                <p>
                    This annotation platform can be used to create better image
                    descriptions for ePub2 or ePub3 files, in order to make
                    e-books more accessible to visually impaired users.
                </p>
                <br />
                <p>
                    <strong>E-BOOK FIXER</strong> has built-in support for:{' '}
                </p>
                <ul>
                    <li>Automatically generated image annotations </li>
                    <li>Manual annotations</li>
                </ul>
            </div>
            <img
                alt=""
                className={styles.epub_logo}
                src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Epub_logo_color.svg"
            />
        </div>
    )
}

EpubInfoPage.propTypes = {}

export default EpubInfoPage
