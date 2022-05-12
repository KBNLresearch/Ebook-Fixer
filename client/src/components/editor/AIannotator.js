import React, { useState } from 'react';
import styles from './Annotator.module.scss';
import { ReactComponent as SettingsSVG } from '../../assets/svgs/settings-icon.svg'

/**
 * The AI annotator component is in charge of classifying the image
 * and querying the server for a black-box AI description for it
 * 
 * @returns The AIannotator component
 */
function AIannotator(props) {

    // TODO: switch to AI generation view??

    // Holds the classification selected by the user 
    // TODO: allow user to change classification later again, after AI generation
    const [classificaton, setClassification] = useState(null);
    
    // TODO: get current ebook UUID stored after upload (Aratrika?)
    const [currEbookUUID, setEbookUUID] = useState(null);

    //TODO: get image name currently selected?
    const [currImgFilename, setImgFilename] = useState("");

    // TODO: get current HTML file name?
    const [currLocation, setLocation] = useState("")



    // TODO: Create function that sets the classification 

    // TODO: Make API call to server
    // {
    //     "ebook": "0133cce7-eace-44c9-95cc-d5b806f18a88",
    //     "filename": "5934001519532275538_cover.jpg",
    //     "location": "wrap0000.html",
    //     "classification": "Decorative",
    //     "raw_context": "RAW CONTEXT"
    // }

    return (
        <div className={styles.ai_input}>
            <textarea placeholder="Please classify your selected image..." disabled></textarea>
            {/* <textarea placeholder="Loading AI annotation..." disabled></textarea> */}
            <button className={styles.icon} disabled><SettingsSVG title="Reclassify"></SettingsSVG></button>
            <button className={styles.save_button}>Save classification</button>   
            <p>Current classification: {classificaton}</p>
        </div>
    )
}

export default AIannotator;