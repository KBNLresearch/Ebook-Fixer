import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'

/**
 * The AISelection component handles selection of AI types
 * After this step the AIAnnotator component will deal with generating 
 * the actual annotations using that AI selected
 * 
 * @param {{setStage: SetStateAction}} props Sets the next stage in annotation process 
 * @param {{currAiSelected: String}} props AI type selected by user
 * @param {{setCurrAiSelected: SetStateAction}} props Sets the AI choice of the user
 * @returns the AISelection component
 */
function AISelection({setStage, currAiSelected, setCurrAiSelected}) {
    
    const dropdownRef = useRef(null)
    const saveAiChoiceButtonRef = useRef(null)

    // TODO: Make the abbreviations and values match the ones on the server once all AI endpoints are final
    // (needed for displaying the most recent AI annotation choice in Annotator.js)
    const options = [
        {keys: ['BB_GOOGLE_LAB'], val: 'Google Vision API'},
        {keys: ['BB_AZURE_LAB', 'BB_AZURE_SEN'], val: 'Microsoft Azure Vision API'},
        {keys: ['CONTEXT_LAB'], val: 'BERT Context Keyword Extractor'}
    ]

    useEffect(() => {
        
        saveAiChoiceButtonRef.current.disabled = false

        if (currAiSelected != null) {
            saveAiChoiceButtonRef.current.disabled = true
            // Show the selected AI in dropdown menu
            const idx = options.findIndex(opt => opt.val === currAiSelected || opt.keys.includes(currAiSelected)) + 1;
            console.log('Idx: ' + idx)
            dropdownRef.current.selectedIndex = idx;
        } else {
            // Show the label
            dropdownRef.current.selectedIndex = 0
            saveAiChoiceButtonRef.current.disabled = false
        }

    }, [])



    /**
     * @returns the AI type selected in dropdown menu
     */
    function getSelectedAi() {
        const choice =  dropdownRef.current.options[dropdownRef.current.selectedIndex].value
        if (dropdownRef.current.selectedIndex === 0) {
            window.alert('This option is not allowed!')
            return 'Invalid'
        }
        return choice   
    }


    /**
     * Stores the AI selected in dropdown menu
     * and disables the "Save AI" button
     */
    function handleAiClick() {

        const choice = getSelectedAi()
        setCurrAiSelected(choice)

         // TODO: enable generate button in next stage again, when new AI is selected

        if (choice !== 'Invalid') {
            saveAiChoiceButtonRef.current.disabled = true
            saveAiChoiceButtonRef.current.innerText = 'AI saved'
            setStage('annotate')
        } else {
            saveAiChoiceButtonRef.current.disabled = false
        } 
    }


    return (
        <div className={styles.ai_input}>

        <label htmlFor="selectClass">
            Please select AI to generate annotations
        </label>
        <select
            ref={dropdownRef}
            className={styles.dropdown}
            onChange={() => {
                saveAiChoiceButtonRef.current.disabled = false
            }}>
            <option value="none" selected disabled hidden>
                Select AI
            </option>
            {options.map((opt) => (
                <option value={opt.val}> {opt.val} </option>
            ))}
        </select>
        <button
            type="button"
            className={styles.save_button}
            ref={saveAiChoiceButtonRef}
            onClick={() => handleAiClick()}>
            {' '}
            Save AI{' '}
        </button>
        </div> 
    )
}

AISelection.propTypes = {
    setStage: PropTypes.func.isRequired,
    currAiSelected: PropTypes.string.isRequired,
    setCurrAiSelected: PropTypes.func.isRequired
}

export default AISelection


