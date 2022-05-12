import React, { useEffect, useState } from 'react';
import styles from './Annotator.module.scss';
import { ReactComponent as HistorySVG } from '../../assets/svgs/history-icon.svg'
import AIannotator from './AIannotator'
import { ImageInfo } from '../../helpers/EditorHelper';

/**
 * The user Annotator component has a textbox with a button for the history of the annotations for that image.
 * It should receive the history of the annotations.
 * And a function to save the annotation somewhere once the user types it.
 * 
 * @param {{annotationList: List of Strings}} List of the annotations for this image
 * @returns The UserAnnotator component
 */
function UserAnnotator(props) {
    const [typing, setTyping] = useState(false);
    const [textValue, setTextValue] = useState("");

    useEffect(() => {
        let list = props.annotationList
        if (list.length > 0) {
            setTextValue(list[list.length-1])
        }
    }, [props.annotationList])

    return (
        <div className={styles.user_input}>
            <textarea value={textValue}
                onChange={(e) => { setTextValue(e.target.value) }}
                placeholder="Your annotation here..."
                onFocus={() => { setTyping(true) }}
                onBlur={() => { setTyping(false) }}>
            </textarea>
            <button className={styles.icon + ' ' + (typing ? styles.transparent : '')}><HistorySVG title="Annotation History"></HistorySVG></button>
        </div>
    )
}

/**
 * Annotator component is meant to help the user produce an annotation for an image as an end result
 * It has an AI component for classifying images and generating AI descriptions
 * And a user component for letting the user annotate images
 * 
 * @param {{currentImage: ImageInfo}} props The props of the component
 * @returns Tha Anotator Component
 */
function Annotator(props) {

    const [userAnnotationList, setUserAnnotationList] = useState([])

    // Executed every time the currentImage changes
    useEffect(() => {
        let imgInfo = props.currentImage;
        if (imgInfo) {
            console.log(imgInfo);
            let altText = imgInfo.element.alt
            if (altText) {
                setUserAnnotationList([altText])
            }
        }
    }, [props.currentImage])
    
    return (
        <div className={styles.container}>
            <AIannotator> currentImage={props.currentImage} </AIannotator>
            <UserAnnotator annotationList={userAnnotationList}></UserAnnotator>
            <button className={styles.save_button}>Save Annotation</button>
        </div>
    )
}

export default Annotator;