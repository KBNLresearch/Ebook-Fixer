import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useParams } from 'react-router-dom'
import { ImageInfo } from '../../helpers/EditorHelper'
import styles from './Overview.module.scss'
import { getImgFilename } from '../../helpers/EditImageHelper'
import { ReactComponent as ExpandSVG } from '../../assets/svgs/fullscreen-icon.svg'

/**
 * This component provides the user with a way to see all the images in the book at once,
 * it also takes the place of the annotator when no image is selected
 *
 * @param {ImageInfo[]} imageList List of images that epubJS found in the ebook
 * @component
 * @returns
 */
function Overview({ imageList }) {
    const { uuid } = useParams()

    const [expanded, setExpanded] = useState(false)
    const imageLimit = 5

    return (
        <div
            className={
                styles.container + ' ' + (expanded ? styles.expanded : '')
            }>
            <button
                type="button"
                className={styles.expandbtn}
                onClick={() => {
                    setExpanded(!expanded)
                }}>
                <ExpandSVG aria-hidden="true" />
                {expanded ? 'Collapse ' : 'Expand '}
                Overview
            </button>
            <div className={styles.overview_info}>
                Showing {expanded ? imageList.length - 1 : imageLimit} images
                {expanded ? '' : <div>Expand the overview to see more</div>}
                <div>Click on an image to annotate it</div>
            </div>
            <div className={styles.gallery}>
                {imageList
                    .slice(0, expanded ? imageList.length - 1 : imageLimit)
                    .map((img, i) => (
                        <Link
                            to={`/ebook/${uuid}/image/${encodeURIComponent(
                                getImgFilename(img)
                            )}`}
                            key={getImgFilename(img)}>
                            {React.createElement('img', {
                                src: img.replacementUrl,
                                id: `overViewImage${i}`,
                                className: styles.img,
                            })}
                        </Link>
                    ))}
            </div>
        </div>
    )
}

Overview.propTypes = {
    imageList: PropTypes.arrayOf(PropTypes.instanceOf(ImageInfo)).isRequired,
}

export default Overview
