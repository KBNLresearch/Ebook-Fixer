import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react'
import { fetchExampleApiCall } from './ApiCalls';

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
            <img src={logo} className="App-logo" alt="logo" />
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
