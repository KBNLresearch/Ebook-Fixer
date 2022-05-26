import { useEffect, useRef, useState } from 'react'
import styles from './ProgressBar.module.scss'


function ProgressBar() {


    // TODO: create arrow elements (row flex)

    // TODO: get props from Annotator parent

    // TODO: change colour of arrow depending on which stage
    // TODO: Make everything coloured for overview

    return (
        <div className={styles.progress_container}> 
            <div className={styles.class_step} > 
                <span> Classification </span>
            </div>
            <div className={styles.ai_step}>
                 <span> AI </span>
            </div>
            <div className={styles.manual_step}> 
                <span> Manual </span>
            </div>
            <div className={styles.save_step}> 
                <span> Save </span>
            </div>
        </div>
    )

}

export default ProgressBar