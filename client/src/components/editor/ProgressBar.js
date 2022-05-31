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
 * @param {String} currAiSelected The AI that is currently selected, can be null if nothing is selected
 * @component
 * @returns The ProgressBar component
 */
function ProgressBar({
    currStage,
    setStage,
    classification,
    userAnnotations,
    currAiSelected,
}) {
    const root = document.querySelector(':root')
    const colorSavedStage = 'lightblue'
    const colorNextStage = '#b8c1c3'

    /**
     * Checks current state and
     * @returns the corresponding CSS class for the 'Classify' button in progress bar
     */
    function getStyleClassification() {
        if (classification !== null) {
            root.style.setProperty('--background_class', colorSavedStage)
        } else {
            root.style.setProperty('--background_class', colorNextStage)
        }
        return styles.class_step + ' ' + styles.right_arrow
    }

    /**
     * Checks current state and
     * @returns the corresponding CSS class for the 'AI' button in progress bar
     */
    function getStyleAi() {
        if (currAiSelected !== null) {
            root.style.setProperty('--background_ai', colorSavedStage)
        } else if (currStage === 'classify') {
            root.style.setProperty('--background_ai', colorNextStage)
        }
        return (
            styles.ai_step + ' ' + styles.left_arrow + ' ' + styles.right_arrow
        )
    }

    /**
     * Checks current state and
     * @returns the corresponding CSS class for the 'Manual' button in progress bar
     */
    function getStyleManual() {
        if (userAnnotations.length > 0) {
            root.style.setProperty('--background_manual', colorSavedStage)
        } else {
            root.style.setProperty('--background_manual', colorNextStage)
        }
        return (
            styles.manual_step +
            ' ' +
            styles.left_arrow +
            ' ' +
            styles.right_arrow
        )
    }

    /**
     * Checks current state and
     * @returns the corresponding CSS class for the 'Save' button in progress bar
     */
    function getStyleReview() {
        root.style.setProperty('--background_check', colorNextStage)

        return styles.review_step + ' ' + styles.left_arrow
    }

    /**
     * A neat class to make it easier to edit / create stages
     *
     * @param {String} key The stage name / the key that identifies this stage
     * @param {String} name The text displayed on the button of the stage
     * @param {Function} className Getter for the classes for that button
     * @returns
     */
    function Stage(key, name, className, ref) {
        return {
            key,
            name,
            getClass: className,
            ref,
        }
    }

    /**
     * The list of stages that are part of the annotation process
     */
    const stages = [
        Stage('classify', 'Classification', getStyleClassification),
        Stage('ai-selection', 'AI', getStyleAi),
        Stage('annotate', 'Manual', getStyleManual),
        Stage('overview', 'Review', getStyleReview),
    ]

    // Note that user can go back and forth to any step, unless not classified yet
    return (
        <div className={styles.progress_container}>
            {stages.map((stage) => (
                <button
                    type="button"
                    className={
                        styles.step +
                        ' ' +
                        stage.getClass() +
                        ' ' +
                        (currStage === stage.key ? styles.activeBtn : '')
                    }
                    ref={stage.ref}
                    key={stage.key}
                    disabled={classification === null}
                    onClick={() => {
                        setStage(stage.key)
                    }}>
                    <span>{stage.name}</span>
                </button>
            ))}
        </div>
    )
}

ProgressBar.defaultProps = {
    currAiSelected: null,
}

ProgressBar.propTypes = {
    currStage: PropTypes.string.isRequired,
    setStage: PropTypes.func.isRequired,
    classification: PropTypes.string.isRequired,
    userAnnotations: PropTypes.arrayOf(String).isRequired,
    currAiSelected: PropTypes.string,
}

export default ProgressBar
