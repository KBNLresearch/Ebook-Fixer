import { Routes, Route, Link } from 'react-router-dom'
import './App.scss'
import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Editor from './components/editor/Editor'
import { ReactComponent as GoBackArrowSVG } from './assets/svgs/go-back-arrow.svg'
import logo from './assets/svgs/logo.svg'
import EpubInfoPage from './components/EpubInfoPage'
import NotFound from './components/errorpages/NotFound'

// This code uses functional components, you could use classes instead but they require more boilerplate

/**
 * The App component is the main container component for our system,
 * It defines the routes to be used by React Router
 * and has important states that are passed down to a large portion of its children
 * (i.e. the e-book file, Id of the e-book and the title)
 *
 * @component
 * @returns The App Component
 */
function App() {
    const [ebookFile, setEbookFile] = useState(null)
    const [ebookId, setEbookId] = useState(null)
    const [ebookTitle, setEbookTitle] = useState(null)

    return (
        <div className="App">
            <header className="App-header">
                <Routes>
                    <Route
                        path="/"
                        element={
                        <div>
                            <img alt="" className="logo" src={logo} />
                            <h1 className="logo_title"> E-BOOK FIXER </h1>
                            <h2 className="logo_subtitle"> Improve image descriptions for ePubs! </h2>
                            <br/>
                            <br/>
                        </div>
                    }
                    />
                    <Route
                        path="*"
                        element={
                            <Link to="/" className="home-navigation">
                                <GoBackArrowSVG />
                                Go Back
                            </Link>
                        }
                    />
                </Routes>
            </header>
            <main className="App-main">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="App-main">
                                <FileUpload
                                    setEbookFile={setEbookFile}
                                    setEbookId={setEbookId}
                                    setEbookTitle={setEbookTitle}
                                />
                                <EpubInfoPage />
                            </div>
                        }
                    />
                    <Route
                        path="/ebook/:uuid"
                        element={
                            <Editor
                                ebookFile={ebookFile}
                                ebookId={ebookId}
                                ebookTitle={ebookTitle}
                            />
                        }>
                        <Route
                            path="image/:imgFilename"
                            element={
                                <Editor
                                    ebookFile={ebookFile}
                                    ebookId={ebookId}
                                    ebookTitle={ebookTitle}
                                />
                            }
                        />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    )
}

export default App
