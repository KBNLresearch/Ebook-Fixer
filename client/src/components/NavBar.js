import {
    Link,
    Routes,
    Route,
    useLocation,
    useNavigate,
    useParams,
} from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './NavBar.module.scss'
import { ReactComponent as MenuSVG } from '../assets/svgs/menu-icon.svg'
import { ReactComponent as GoBackArrowSVG } from '../assets/svgs/go-back-arrow.svg'
import FileDownload from './FileDownload'
import Sidebar from './Sidebar'

import logo from '../assets/svgs/logo.svg'
import ShareURL from './editor/ShareURL'

function NavBar({}) {
    const { uuid, imgFilename } = useParams()

    return (
        <Routes>
            <Route
                path="*"
                element={
                    <div className={styles.navbar}>
                        <Sidebar />
                    </div>
                }
            />
            <Route
                path="/ebook/:uuid"
                element={
                    <div className={styles.navbar}>
                        <Sidebar download />
                        <div className={styles.title}>
                            <Link to="/">
                                <img
                                    alt="E-BOOK FIXER Logo"
                                    className={styles.logo}
                                    src={logo}
                                />
                            </Link>
                            <h1>E-Book Title</h1>
                        </div>
                        <ShareURL />
                    </div>
                }
            />
            <Route
                path="/ebook/:uuid/image/:imgFilename"
                element={
                    <div className={styles.navbar}>
                        <Sidebar download imageSelected />
                        <div className={styles.title}>
                            <Link to="/">
                                <img
                                    alt="E-BOOK FIXER Logo"
                                    className={styles.logo}
                                    src={logo}
                                />
                            </Link>
                            <h1>E-Book Title</h1>
                        </div>
                        <ShareURL />
                    </div>
                }
            />
        </Routes>
    )
}

export default NavBar
