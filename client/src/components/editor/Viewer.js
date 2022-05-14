import PropTypes from 'prop-types'

/**
 * The Viewer component contains the div that holds the rendering of the Ebook
 * Right now, it just needs to create a div with a certain id so that EpubJS can use it to render the ebook.
 *
 * @param {{id: id of the div}} props The props of the component, passed by the parent
 * @returns The Viewer component
 */
function Viewer({ id }) {
    return <div id={id} />
}

Viewer.propTypes = {
    id: PropTypes.string.isRequired,
}

export default Viewer
