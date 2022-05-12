import React, { useState } from 'react';
import styles from './Annotator.module.scss';
import { ReactComponent as HistorySVG } from '../../assets/svgs/history-icon.svg'
import AIannotator from './AIannotator'

/**
 * The user Annotator component has a textbox with a button for the history of the annotations for that image.
 * It should receive the history of the annotations.
 * And a function to save the annotation somewhere once the user types it.
 * 
 * @returns The UserAnnotator component
 */
function UserAnnotator() {
    const [typing, setTyping] = useState(false);

    return (
        <div className={styles.user_input}>
            <textarea placeholder="Your annotation here..." onFocus={() => {setTyping(true)}} onBlur={() => {setTyping(false)}}></textarea>
            <button className={styles.icon + ' ' + (typing ? styles.transparent : '')}><HistorySVG title="Annotation History"></HistorySVG></button>
        </div>
    )
}

/**
 * Annotator component is meant to help the user produce an annotation for an image as an end result
 * It has an AI component for classifying images and generating AI descriptions
 * And a user component for letting the user annotate images
 * 
 * @param {{currentImage: Object containing information about the image that is currently being annotated}} props The props of the component
 * @returns The Anotator Component
 */
function Annotator(props) {
    
    return (
        <div className={styles.container}>
            <AIannotator> currentImage={props.currentImage} </AIannotator>
            <UserAnnotator></UserAnnotator>
            <button className={styles.save_button}>Save Annotation</button>
        </div>
    )
}

export default Annotator;