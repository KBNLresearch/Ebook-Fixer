import { Routes, Route, Link } from 'react-router-dom'
import './App.scss'
import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Editor from './components/editor/Editor'
import { ReactComponent as GoBackArrowSVG } from './assets/svgs/go-back-arrow.svg'
import logo from './assets/images/KB-logo.png'
import EpubInfoPage from './components/EpubInfoPage'
import NotFound from './components/errorpages/NotFound'

// This code uses functional components, you could use classes instead but they're
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
                        element={<img alt="" className="logo" src={logo} />}
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
                            <Editor ebookFile={ebookFile} ebookId={ebookId} ebookTitle={ebookTitle} />
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    )
}

export default App
