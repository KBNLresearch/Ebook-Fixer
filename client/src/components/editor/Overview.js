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
        ...objArr2.find((anObj2) => getImgFilename(anObj1) === anObj2.filename),
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
    // User Annotation
    if (img.annotation) {
        return imageClasses[0]
    }
    // Existing alt-text
    if (img.element.alt) {
        return imageClasses[1]
    }
    // Classified as Decorative
    if (img.classification === 'Decoration') {
        return imageClasses[2]
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

    const [newImageList, setNewImageList] = useState([])

    const [filters, setFilters] = useState(
        new Array(imageClasses.length).fill(false)
    )

    useEffect(() => {
        getImagesOverview(uuid).then((serverImgList) => {
            const list = leftJoinImages(imageList, serverImgList)
            setNewImageList(list)
        })
    }, [imageList, uuid])

    function handleFilterChange(e, i) {
        const newFilters = filters.map((v, index) => {
            if (i === index) {
                return e.target.checked
            }
            return v
        })
        console.log(newFilters)
        setFilters(newFilters)
    }

    function filterNewImages() {
        console.log(newImageList)
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
