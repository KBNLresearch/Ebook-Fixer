import { useAtom } from 'jotai'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import logo from '../assets/svgs/logo.svg'
import { titleContext } from '../helpers/EbookContext'
import ShareURL from './editor/ShareURL'
import styles from './NavBar.module.scss'
import Sidebar from './Sidebar'

/**
 * Provides the user with orientation and navigation in our app.
 * Has a sidebar, a logo leading to the front page.
 * If the user is currently editing an ebook, then it will show:
 * a share link, and the title of the e-book.
 *
 * @returns The NavBar component
 * @component
 */
function NavBar() {
    const [title] = useAtom(titleContext)

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
                            {title === '' ? '' : <h1>Editing: {title} </h1>}
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
                            {title === '' ? '' : <h1>Editing: {title} </h1>}
                        </div>
                        <ShareURL />
                    </div>
                }
            />
        </Routes>
    )
}

export default NavBar
