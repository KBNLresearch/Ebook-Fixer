import React, {useEffect, useRef, useState} from 'react';
import { getFile } from '../DownloadFile.js';

function upload(e) {
    var uuid = "1015cfb3-6daf-4b28-911e-8f2b173f3a6a"
    return (
        <div id="container">
            <h1>Download File using React App</h1>
            <h3>Download Employee Data using Button</h3>
            <button onClick={getFile(uuid)}>Download</button>
            <p/>
            <h3>Download Employee Data using Link</h3>
            <a href="#" onClick={getFile(uuid)}>Download</a>
        </div>
    )


}