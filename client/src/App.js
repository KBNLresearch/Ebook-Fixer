import './App.scss'
import { useState } from 'react'
import { fetchExampleApiCall } from './api/ApiCalls'
import FileUpload from './components/FileUpload'
import Editor from './components/editor/Editor'
import FileDownload from './components/FileDownload'

// This code uses functional components, you could use classes instead but they're
function App() {
    const [result, setResult] = useState([])

    const [ebookFile, setEbookFile] = useState(null)

    const [ebookId, setEbookId] = useState(null)

    function getResult() {
        fetchExampleApiCall().then((data) => {
            setResult(data)
        })
    }

    return (
        <div className="App">
            <header className="App-header">
                <FileUpload
                    setEbookFile={setEbookFile}
                    setEbookId={setEbookId}
                />
                <FileDownload ebookId={ebookId} />
                <p>Press the button below to call the ebooks api:</p>
                <button type="button" onClick={getResult}>
                    Call it{' '}
                </button>
                {result.length === 0 ? '' : 'Result:'}
                <ul id="result">
                    {result.map((ebook) => (
                        <li key={ebook.uuid}>
                            Ebook uuid: {ebook.uuid}, title: {ebook.title}
                        </li>
                    ))}
                </ul>
            </header>
            <main>
                {ebookFile === null ? (
                    ''
                ) : (
                    <Editor ebookFile={ebookFile} ebookId={ebookId} />
                )}
            </main>
        </div>
    )
}

export default App
