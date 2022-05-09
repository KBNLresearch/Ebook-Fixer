import React, { useState } from 'react';
import styles from './Annotator.module.scss';
import { ReactComponent as HistorySVG } from '../../assets/svgs/history-icon.svg'
import AIannotator from './AIannotator'

function UserAnnotator() {
    const [typing, setTyping] = useState(false);

    return (
        <div className={styles.user_input}>
            <textarea placeholder="Your annotation here..." onFocus={() => {setTyping(true)}} onBlur={() => {setTyping(false)}}></textarea>
            <button className={styles.icon + ' ' + (typing ? styles.transparent : '')}><HistorySVG title="Annotation History"></HistorySVG></button>
        </div>
    )
}

function Annotator(props) {
    
    return (
        <div className={styles.container}>
            <AIannotator></AIannotator>
            <UserAnnotator></UserAnnotator>
            <button className={styles.save_button}>Save Annotation</button>
        </div>
    )
}

export default Annotator;