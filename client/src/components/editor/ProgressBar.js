import { useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './ProgressBar.module.scss'


/** The ProgressBar component shows a progress bar on top of editor 
 * showing arrows that are coloured depending on the current stage.
 * 
 * @param {String} currStage Current stage in annotation process
 * @param {SetStateAction} setStage Sets next stage in annotation process
 * @param {String} classification Classification stored for current image under annotation
 * @param {String[]} userAnnotations List of human annotations for current image under annotation
 * @component
 * @returns The ProgressBar component
 */
function ProgressBar({ currStage, setStage, classification, userAnnotations }) {

    const classificationButtonRef = useRef(null)
    const aiSelectionButtonRef = useRef(null)
    const manualButtonRef = useRef(null)
    const reviewButtonRef = useRef(null)

    const root = document.querySelector(':root');
    const colorCurrStage = 'lightgreen'
    const colorSavedStage = 'lightblue'
    const colorNextStage = '#b8c1c3'

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'Classify' button in progress bar
     */
    function getStyleClassification() {
        if (currStage === 'classify') {
            root.style.setProperty('--background_class', colorCurrStage);
        } else if (classification !== null) {
            root.style.setProperty('--background_class', colorSavedStage)
        } else {
            root.style.setProperty('--background_class', colorNextStage)
        }
        return styles.class_step
    }

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'AI' button in progress bar
     */
    function getStyleAi() {
        if (currStage === 'ai-selection') {
           root.style.setProperty('--background_ai', colorCurrStage)
        } else if (currStage === 'classify') {
            root.style.setProperty('--background_ai', colorNextStage)
        } else {
            root.style.setProperty('--background_ai', colorSavedStage)
        }
        return styles.ai_step
    }

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'Manual' button in progress bar
     */
    function getStyleManual() {

        if (currStage === 'annotate') {
            root.style.setProperty('--background_manual', colorCurrStage)
        } else if (userAnnotations.length > 0) {
            root.style.setProperty('--background_manual', colorSavedStage)
        } else {
            root.style.setProperty('--background_manual', colorNextStage)
        }
        return styles.manual_step
    }

    /**
     * Checks current state and 
     * @returns the corresponding CSS class for the 'Save' button in progress bar
     */
    function getStyleReview() {
        if (currStage === 'overview') {
            root.style.setProperty('--background_check', colorCurrStage)
        } else {
            root.style.setProperty('--background_check', colorNextStage)
        }
        return styles.review_step
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
    function handleReviewClick() {
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
                // onMouseOver={root.style.setProperty('--background_class', 'red')}
                // onFocus={root.style.setProperty('--background_class', 'red')}
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
                className={getStyleReview()}
                ref={reviewButtonRef}
                disabled={classification === null}
                onClick={() => handleReviewClick()}> 
                <span> Review </span>
            </button> 

        </div>
    )

}

ProgressBar.propTypes = {
    currStage: PropTypes.string.isRequired,
    setStage: PropTypes.func.isRequired,
    classification: PropTypes.string.isRequired,
    userAnnotations: PropTypes.arrayOf(String).isRequired
}

export default ProgressBar