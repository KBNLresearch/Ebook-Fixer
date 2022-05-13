import React, {useEffect, useRef, useState} from 'react';
import { getFile } from '../api/DownloadFile.js';

/**
 * adds element that handles download process
 * @returns element containing download button
 */
function FileDownload(props) {
     return (
        <div id="container">
            <h3>Download Epub</h3>
            <button onClick={() => getFile(props.ebookId)}>Download</button>
        </div>
    )


}

export default FileDownload;


