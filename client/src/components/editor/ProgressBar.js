import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './ProgressBar.module.scss'


/** Progress bar on top of editor showing arrows that are coloured depending on the current stage.
 * 
 * @param {{currStage: String}} props current stage in annotation process
 * @param {{userAnnotationSaved: bool}} props whether user has pressed "Save" button already
 * @returns The ProgressBar component
 */
function ProgressBar({ currStage, userAnnotationSaved }) {

    function getStyleClassification() {
        if (currStage === 'classify' || currStage === 'ai-selection' || currStage === 'annotate' || currStage === 'overview') {
            return styles.class_step_color
        }
        return styles.class_step
    }

    function getStyleAi() {
        if (currStage === 'ai-selection' || currStage === 'annotate' || currStage === 'overview') {
            return styles.ai_step_color
        }
        return styles.ai_step
    }

    function getStyleManual() {
        if (currStage === 'annotate' || currStage === 'overview') {
            return styles.manual_step_color
        }
        return styles.manual_step
    }

    function getStyleSave() {
        if (currStage === 'overview' || userAnnotationSaved) {
            return styles.save_step_color
        }
        return styles.save_step
    }

    // TODO: set stage on click

    return (
        <div className={styles.progress_container}> 
        
            <button 
                type="button"
                className={getStyleClassification()}
                // onClick={() => }
             > 
                <span> Classification </span>
            </button>

            <button 
                type="button"
                className={getStyleAi()}
                // onClick={() => }
            >
                <span> AI </span>
            </button>
            
            <button
                type="button"
                className={getStyleManual()}
                // onClick={() => }
            > 
                <span> Manual </span>
            </button>
            
            <button 
                type="button"
                className={getStyleSave()}
                // onClick={() => }
            > 
                <span> Save </span>
            </button> 

        </div>
    )

}

ProgressBar.propTypes = {
    currStage: PropTypes.string.isRequired,
    userAnnotationSaved: PropTypes.bool.isRequired
}

export default ProgressBar