import PropTypes from 'prop-types'
import styles from './Editor.module.scss'

/**
 * The Viewer component contains the div that holds the rendering of the Ebook
 * Right now, it just needs to create a div with a certain id so that EpubJS can use it to render the ebook.
 *
 * @param {String} id The id of the div
 * @component
 * @returns The Viewer component
 */
function Viewer({ id }) {
    return <div className={styles.viewer} id={id} />
}

Viewer.propTypes = {
    id: PropTypes.string.isRequired,
}

export default Viewer
