import React from 'react'
import PropTypes from 'prop-types'
import { Link, useParams } from 'react-router-dom'
import { ImageInfo } from '../../helpers/EditorHelper'
import styles from './Overview.module.scss'
import { getImgFilename } from '../../helpers/EditImageHelper'

function Overview({ imageList }) {
    const { uuid } = useParams()

    return (
        <div className={styles.container}>
            {imageList.map((img, i) => (
                <Link
                    to={`/ebook/${uuid}/image/${encodeURIComponent(
                        getImgFilename(img)
                    )}`}>
                    {React.createElement('img', {
                        src: img.replacementUrl,
                        id: `overViewImage${i}`,
                        className: styles.img,
                    })}
                </Link>
            ))}
        </div>
    )
}

Overview.propTypes = {
    imageList: PropTypes.arrayOf(PropTypes.instanceOf(ImageInfo)).isRequired,
}

export default Overview
