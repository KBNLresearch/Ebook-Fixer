import './App.scss';
import React, { useState } from 'react'
import { fetchExampleApiCall } from './api/ApiCalls';
import FileUpload from './components/FileUpload';
import Editor from './components/editor/Editor';
import FileDownload from './components/FileDownload';
import { BrowserRouter, Routes, Route, Link, } from "react-router-dom";

// This code uses functional components, you could use classes instead but they're
function App() {

    const [result, setResult] = useState([]);

    const [ebookFile, setEbookFile] = useState(null);

    function getResult() {
        fetchExampleApiCall().then(data => {
            setResult(data)
        })
    }

    return (
        <div className="App">            
            <header className="App-header">
                <Routes>
                    <Route path="/" element={<h1>Fixing E-Books</h1>}>
                        
                    </Route>
                    <Route path="*" element={<h1><Link to="/">Go Back</Link></h1>}/>
                </Routes>
            
        </header>
            <main>
                
                    <Routes>
                    <Route path="/" element={<FileUpload setEbookFile={setEbookFile}></FileUpload>} />
                    <Route path="/ebook/:uuid" element={<Editor ebookFile={ebookFile}></Editor> }/>
                    </Routes>
            
            {/* <FileDownload></FileDownload>
            <p>
            Press the button below to call the ebooks api:
            </p>
            <button onClick={getResult}>Call it </button>
            {result.length === 0 ? "" : "Result:"}
            <ul id="result">
                {result.map(ebook => {
                    return <li key={ebook.uuid}>Ebook uuid: {ebook.uuid}, title: {ebook.title}</li>
                })}
            </ul> */}
        </main>
        </div>
    );
}

export default App;
