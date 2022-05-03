import './App.css';
import React, { useState } from 'react'
import { fetchExampleApiCall } from './api/ApiCalls';
import FileUpload from './components/FileUpload';

// This code uses functional components, you could use classes instead but they're
function App() {

    const [result, setResult] = useState([]);

    function getResult() {
        fetchExampleApiCall().then(data => {
            setResult(data)
        })
    }

    return (
        <div className="App">
        <header className="App-header">
            <FileUpload></FileUpload>
            <p>
            Press the button below to call the ebooks api:
            </p>
            <button onClick={getResult}>Call it </button>
            {result.length === 0 ? "" : "Result:"}
            <ul id="result">
                {result.map(ebook => {
                    return <li key={ebook.uuid}>Ebook epub3_path: {ebook.epub3_path}, title: {ebook.title}</li>
                })}
            </ul>
        </header>
        </div>
    );
}

export default App;
