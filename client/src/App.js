import { Routes, Route, Link } from 'react-router-dom'
import './App.scss'
import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Editor from './components/editor/Editor'
import { ReactComponent as GoBackArrowSVG } from './assets/svgs/go-back-arrow.svg'

// This code uses functional components, you could use classes instead but they're
function App() {
    const [ebookFile, setEbookFile] = useState(null)

    const [ebookId, setEbookId] = useState(null)

    return (
        <div className="App">
            <header className="App-header">
                <h1>E-BOOK FIXER</h1>
                <Routes>
                    <Route path="/" element={<p>Homepage</p>} />
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
                            <FileUpload
                                setEbookFile={setEbookFile}
                                setEbookId={setEbookId}
                            />
                        }
                    />
                    <Route
                        path="/ebook/:uuid"
                        element={
                            <Editor ebookFile={ebookFile} ebookId={ebookId} />
                        }
                    />
                </Routes>
            </main>
        </div>
    )
}

export default App
