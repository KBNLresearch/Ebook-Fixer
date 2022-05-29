import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './ProgressBar.module.scss'


/** The ProgressBar component shows a progress bar on top of editor 
 * showing arrows that are coloured depending on the current stage
 * 
 * @param {{currStage: String}} props Current stage in annotation process
 * @param {{setStage: SetStateAction}} props Sets next stage in annotation process
 * @param {{classification: String}} props Classification stored for current image under annotation
 * @param {{aiChoice: String}} props Most recent AI choice for current image under annotation
 * @param {{userAnnotations: List of Strings}} props List of human annotations for current image under annotation
 * @returns The ProgressBar component
 */
function ProgressBar({ currStage, setStage, classification, aiChoice, userAnnotations }) {

    const classificationButtonRef = useRef(null)
    const aiSelectionButtonRef = useRef(null)
    const manualButtonRef = useRef(null)
    const saveButtonRef = useRef(null)
    const root = document.querySelector(':root');

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'Classify' button in progress bar
     */
    function getStyleClassification() {
        if (currStage === 'classify') {
            root.style.setProperty('--background_class', 'skyblue');
        } else if (classification !== null) {
            root.style.setProperty('--background_class', 'lightblue')
        } else {
            root.style.setProperty('--background_class', '#b8c1c3')
        }
        return styles.class_step
    }

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'AI' button in progress bar
     */
    function getStyleAi() {
        if (currStage === 'ai-selection') {
           root.style.setProperty('--background_ai', 'skyblue')
        } else if (aiChoice !== null) {
            root.style.setProperty('--background_ai', 'lightblue')
        } else {
            root.style.setProperty('--background_ai', '#b8c1c3')
        }
        return styles.ai_step
    }

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'Manual' button in progress bar
     */
    function getStyleManual() {

        if (currStage === 'annotate') {
            root.style.setProperty('--background_manual', 'skyblue')
        } else if (userAnnotations.length > 0) {
            root.style.setProperty('--background_manual', 'lightblue')
        } else {
            root.style.setProperty('--background_manual', '#b8c1c3')
        }
        return styles.manual_step
    }

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'Save' button in progress bar
     */
    function getStyleCheck() {
        if (currStage === 'overview') {
            root.style.setProperty('--background_check', 'skyblue')
        } else {
            root.style.setProperty('--background_check', '#b8c1c3')
        }
        return styles.check_step
    }

    /**
     * Makes sure user returns to classification tab again
     */
    function handleClassificationClick() {        
        setStage('classify')
    }

    /**
     * Makes sure user returns to AI selection tab again
     */
    function handleAiClick() {
        setStage('ai-selection')
    }

    /**
     * Makes sure user returns to manual annotation (+ AI generation) tab again
     */
    function handleManualClick() {
        setStage('annotate')
    }

    /**
     * Makes sure user returns to overview tab
     */
    function handleCheckClick() {
        setStage('overview')
    }



    // Note that user can go back and forth to any step, unless not classified yet
    return (
        <div className={styles.progress_container}> 
        
            <button 
                type="button"
                className={getStyleClassification()}
                ref={classificationButtonRef}
                disabled={classification === null}
                onClick={() => handleClassificationClick()}> 
                <span> Classification </span>
            </button>

            <button 
                type="button"
                className={getStyleAi()}
                ref={aiSelectionButtonRef}
                disabled={classification === null}
                onClick={() => handleAiClick()}>
                <span> AI </span>
            </button>
            
            <button
                type="button"
                className={getStyleManual()}
                ref={manualButtonRef}
                disabled={classification === null}
                onClick={() => handleManualClick()}> 
                <span> Manual </span>
            </button>
            
            <button 
                type="button"
                className={getStyleCheck()}
                ref={saveButtonRef}
                disabled={classification === null}
                onClick={() => handleCheckClick()}> 
                <span> Check </span>
            </button> 

        </div>
    )

}

ProgressBar.propTypes = {
    currStage: PropTypes.string.isRequired,
    setStage: PropTypes.func.isRequired,
    classification: PropTypes.string.isRequired,
    aiChoice: PropTypes.string.isRequired,
    userAnnotations: PropTypes.arrayOf(String).isRequired
}

export default ProgressBar