import React, {useEffect, useRef, useState} from 'react';
import { getFile } from '../api/DownloadFile.js';

/**
 * adds element that handles download process
 * @returns element containing download button
 */
function FileDownload() {
     return (
        <div id="container">
            <h3>Download Epub</h3>
            <button onClick={() => getFile("1015cfb3-6daf-4b28-911e-8f2b173f3a6a")}>Download</button>
        </div>
    )


}

export default FileDownload;


