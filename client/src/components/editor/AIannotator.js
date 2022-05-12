import React, { useEffect, useState } from 'react';
import styles from './Annotator.module.scss';
import { ReactComponent as SettingsSVG } from '../../assets/svgs/settings-icon.svg'
import { classifyImageApiCall } from '../../api/ClassifyImage.js';

/**
 * The AI annotator component is in charge of classifying the image
 * and querying the server for a black-box AI description for it
 * @param {{currImage: ImageInfo}} props The props of the component
 * @param {{currEbook: EbookInfo}} props The props of the component
 * @returns The AIannotator component
 */
function AIannotator(props) {

    // useEffect(() => {
    //     let currImage = props.currentImage

    // }, [props.currentImage])


    // TODO: switch to AI generation view --> show textArea instead of dropdown menu

    // // Holds the classification selected by the user 
    // // TODO: allow user to change classification later again, after AI generation
    // const [classificaton, setClassification] = useState(getClassification());

    // // Creates a hook that executes the arrow func. every time the ... changes
    // useEffect(() => {
    //     console.log('Current classification: ' + classificaton)
    // }, [classificaton])

    // Gets the currently selected classification
    function getClassification() {
        var dropdown = document.getElementById('class_id')
        var choice = dropdown.options[dropdown.selectedIndex].value
        console.log('Classification chosen: ' + choice)
        return choice;
    }

    // TODO: Aratrika?
    function getEbookUUID() {

    }

    /**
     * @returns the filename of the classified image
     * For example: "2874324973610680654_cover.jpg"
     */
    function getImgFilename() {
        var currImageName = props.currImage.asset.href
        console.log('Current image classified: ' + currImageName)
        return currImageName
    }

    function getLocation() {
        var currHTMLFile = props.currImage.section.href
        console.log('Curr HTML file of classified image: ' + currHTMLFile)
        return currHTMLFile
    }

    function getRawContext() {
        return 'RAW CONTEXT'

    }


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
            {/* Showing the textarea only after classification, in the AI generation step */}
            {/* <textarea placeholder="Loading AI annotation..." disabled></textarea> */}
            <button className={styles.icon} disabled><SettingsSVG title='Reclassify'></SettingsSVG></button>    
            <label for='class_id'>Please classify your selected image...:</label>
                <select name='selected_class' id='class_id'>
                <option value='Decorative' selected >Decorative</option>
                <option value='Informative'>Informative</option>
                <option value='Photo'>Photo</option>
                <option value='Illustration'>Illustration</option>
                <option value='Figure'>Figure</option>
                <option value='Symbol'>Symbol</option>
                <option value='Drawing'>Drawing</option>
                <option value='Comic'>Comic</option>
                <option value='Logo'>Logo</option>
                <option value='Graph'>Graph</option>
                <option value='Map'>Map</option>
                </select>
            <button className={styles.save_button} onClick={() => classifyImageApiCall(getEbookUUID(), getImgFilename(), getLocation(), getClassification(), getRawContext())}> Save classification </button>        
        </div>
    )
}

export default AIannotator;