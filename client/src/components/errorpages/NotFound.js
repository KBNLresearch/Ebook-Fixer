import { Link } from 'react-router-dom'
import styles from './NotFound.module.scss'

function NotFound() {
    return (
        <div className={styles.container}>
            <h1 className={styles.cool_text}>404</h1>
            <p>The page you were looking for was not found!</p>
            <Link to="/">Back to the Homepage</Link>
        </div>
    )
}

export default NotFound
