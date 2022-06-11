import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useParams } from 'react-router-dom'
import { ImageInfo } from '../../helpers/EditorHelper'
import styles from './Overview.module.scss'
import { getImgFilename } from '../../helpers/EditImageHelper'
import { ReactComponent as ExpandSVG } from '../../assets/svgs/fullscreen-icon.svg'
import { getImagesOverview } from '../../api/GetImagesOverview'

// Join the ImageList with server results, keeping everything from Imagelists
const leftJoinImages = (objArr1, objArr2) =>
    objArr1.map((anObj1) => ({
        ...objArr2.find(
            (anObj2) => getImgFilename(anObj1) === anObj2.image.filename
        ),
        ...anObj1,
    }))

/**
 * Gets the styles class of an image based on it's characteristics
 *
 * @param {ImageInfo+} img ImageInfo object with the response from the server attached
 * @private
 * @returns String, a name of a class based on the parameters of the image
 */
function getImageClass(img) {
    // The order of these If statements MATTERS,
    // Because we want to display user changes first
    // So a user annotation / classification as decorative OVERRIDES an existing alt text
    // Classified as Decorative
    if (img.image && img.image.classification === 'Decoration') {
        return imageClasses[2]
    }
    // User Annotation
    if (img.annotated === true) {
        return imageClasses[0]
    }
    // Existing alt-text
    if (img.element.alt) {
        return imageClasses[1]
    }
    // No annotation
    return imageClasses[3]
}

const imageClasses = [
    'annotated',
    'existing_alt',
    'decorative',
    'not_annotated',
]

const prettyImageClasses = [
    'Annotated',
    'Existing alt-text',
    'Decorative',
    'Not Annotated',
]

/**
 * The Overview component provides the user with a way to see all the images in the book at once,
 * it also takes the place of the annotator when no image is selected
 *
 * @param {ImageInfo[]} imageList List of images that epubJS found in the ebook
 * @component
 * @returns the Overview component
 */
function Overview({ imageList }) {
    const { uuid } = useParams()

    const [expanded, setExpanded] = useState(false)
    const imageLimit = 5

    const [serverImageList, setServerImageList] = useState([])

    const [newImageList, setNewImageList] = useState([])

    const [filters, setFilters] = useState(
        new Array(imageClasses.length).fill(false)
    )

    // Set the new image list with whatever is in the server image list joined with the normal image list.
    // The server image list can be empty
    useEffect(() => {
        const list = leftJoinImages(imageList, serverImageList)
        setNewImageList(list)
    }, [imageList, serverImageList])

    // Send a request for the server images list when the page loads
    useEffect(() => {
        if (serverImageList.length === 0) {
            getImagesOverview(uuid).then((serverImgList) => {
                setServerImageList(serverImgList.images)
            })
        }
    }, [serverImageList.length, uuid])

    // When someone presses one of the filters, we need to update the state
    function handleFilterChange(e, i) {
        const newFilters = filters.map((v, index) => {
            if (i === index) {
                return e.target.checked
            }
            return v
        })
        setFilters(newFilters)
    }

    // Filter the list of images
    function filterNewImages() {
        return newImageList
            .slice(0, expanded ? imageList.length : imageLimit)
            .filter((img) => {
                if (filters.some((e) => e)) {
                    return filters[imageClasses.indexOf(getImageClass(img))]
                }
                return true
            })
    }

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
                overview
            </button>
            <div className={styles.overview_info}>
                Showing {filterNewImages().length} /{' ' + imageList.length}{' '}
                images
                {expanded ? '' : <div>Expand the overview to see more</div>}
                <div>Click on an image to annotate it</div>
            </div>

            {expanded ? (
                <div className={styles.filters}>
                    <p>Filter Images: </p>
                    {imageClasses.map((classStr, i) => (
                        <div className={styles.filter}>
                            <input
                                type="checkbox"
                                id={classStr}
                                name={classStr}
                                value={classStr}
                                className={styles[classStr]}
                                onChange={(e) => {
                                    handleFilterChange(e, i)
                                }}
                            />
                            <label htmlFor={classStr}>
                                {prettyImageClasses[i]}
                            </label>
                        </div>
                    ))}
                </div>
            ) : (
                ''
            )}

            <div className={styles.gallery}>
                {filterNewImages().map((img, i) => (
                    <Link
                        to={`/ebook/${uuid}/image/${encodeURIComponent(
                            getImgFilename(img)
                        )}`}
                        aria-label={`Link to image ${i}`}
                        key={getImgFilename(img)}>
                        {React.createElement('img', {
                            src: img.replacementUrl,
                            id: `overViewImage${i}`,
                            className:
                                styles.img + ' ' + styles[getImageClass(img)],
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
