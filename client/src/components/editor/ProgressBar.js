import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './ProgressBar.module.scss'


/** Progress bar on top of editor showing arrows that are coloured depending on the current stage.
 * 
 * @param {{currStage: String}} props current stage in annotation process
 * @param {{setStage: SetStateAction}} props sets next stage in annotation process
 * @param {{}}
 * @param {{}}
 * @param {{userAnnotationSaved: bool}} props whether user has pressed "Save" button already
 * @param {{setUserAnnotationSaved: SetStateAction}} props sets whether user has pressed "Save" button
 * @returns The ProgressBar component
 */
function ProgressBar({ currStage, setStage, classificationSaved, aiSaved, userAnnotationSaved, setUserAnnotationSaved }) {

    const classificationButtonRef = useRef(null)
    const aiSelectionButtonRef = useRef(null)
    const manualButtonRef = useRef(null)
    const saveButtonRef = useRef(null)

    function getStyleClassification() {
        if (currStage === 'classify' || classificationSaved) {
            return styles.class_step_color
        }
        return styles.class_step
    }

    function getStyleAi() {
        if (currStage === 'ai-selection' || aiSaved) {
            return styles.ai_step_color
        }
        return styles.ai_step
    }

    function getStyleManual() {
        if (currStage === 'annotate' || userAnnotationSaved) {
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

    // TODO: make first arrow grey if no image selected yet
    
    // TODO: add javadoc

    
    function handleClassificationClick() {        
        console.log('Return to classification step')
        // TODO: show selected class (adjust selected idx)
        setStage('classify')
        setUserAnnotationSaved(false)
    }

    function handleAiClick() {
        console.log('Return to AI selection step')
        // TODO: show selected AI (adjust selected idx)
        setStage('ai-selection')
        setUserAnnotationSaved(false)
    }

    function handleManualClick() {
        console.log('Return to manual step')
        // TODO: show generated AI + saved human annotation
        setStage('annotate')
        setUserAnnotationSaved(false)
    }

    function handleSaveClick() {
        console.log('Go to save step')
        // TODO: show stored info when going back! (get props from Annotator) 
        setStage('overview')
    }



    return (
        <div className={styles.progress_container}> 
        
            <button 
                type="button"
                className={getStyleClassification()}
                ref={classificationButtonRef}
                // disabled={currStage === 'classify'}
                onClick={() => handleClassificationClick()}> 
                <span> Classification </span>
            </button>

            <button 
                type="button"
                className={getStyleAi()}
                ref={aiSelectionButtonRef}
                // disabled={currStage === 'classify' || currStage === 'ai-selection'}
                onClick={() => handleAiClick()}>
                <span> AI </span>
            </button>
            
            <button
                type="button"
                className={getStyleManual()}
                ref={manualButtonRef}
                // disabled={currStage === 'classify' || currStage === 'ai-selection' || currStage === 'manual'}
                onClick={() => handleManualClick()}> 
                <span> Manual </span>
            </button>
            
            <button 
                type="button"
                className={getStyleSave()}
                ref={saveButtonRef}
                // disabled={false}
                onClick={() => handleSaveClick()}> 
                <span> Save </span>
            </button> 

        </div>
    )

}

ProgressBar.propTypes = {
    currStage: PropTypes.string.isRequired,
    setStage: PropTypes.func.isRequired,
    classificationSaved: PropTypes.bool.isRequired,
    aiSaved: PropTypes.bool.isRequired,
    userAnnotationSaved: PropTypes.bool.isRequired,
    setUserAnnotationSaved: PropTypes.func.isRequired
}

export default ProgressBar