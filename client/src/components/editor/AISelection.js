import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'

/**
 * The AISelection component handles selection of various AI types, such as Google Vision or Microsoft Azure.
 * After this step the AIAnnotator component will deal with generating the actual annotations using that AI.
 * 
 * @param {external:SetStateAction} setStage Sets the next stage in annotation process 
 * @param {String} currAiSelected AI type selected by user
 * @param {external:SetStateAction} setCurrAiSelected Sets the AI choice of the user
 * @component
 * @returns the AISelection component
 */
function AISelection({setStage, currAiSelected, setCurrAiSelected, setAiAnnotationList, setSentence}) {
    
    const dropdownRef = useRef(null)
    const saveAiChoiceButtonRef = useRef(null)

    // TODO: Make the types match the ones on the server once all AI endpoints are final
    // (needed for displaying the most recent AI annotation choice in Annotator.js)
    const options = [
        {key: 'GG', val: 'Google Vision', types: ['BB_GOOGLE_LAB']},
        {key: 'MS', val: 'Microsoft Azure', types: ['BB_AZURE_LAB', 'BB_AZURE_SEN']}
    ]

    useEffect(() => {
        
        saveAiChoiceButtonRef.current.disabled = false

        if (currAiSelected != null) {
            saveAiChoiceButtonRef.current.disabled = true
            // Show the selected AI in dropdown menu
            const idx = options.findIndex(opt => opt.val === currAiSelected || opt.key === currAiSelected 
                                            || opt.types.includes(currAiSelected)) + 1;
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
                setAiAnnotationList([])
                setSentence(null)
            }}>
            <option value="none" selected disabled hidden>
                Select AI
            </option>
            {options.map((opt) => (
                <option value={opt.val} key={opt.key}> {opt.val} </option>
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
    setCurrAiSelected: PropTypes.func.isRequired,
    setAiAnnotationList: PropTypes.func.isRequired,
    setSentence: PropTypes.func.isRequired
}

export default AISelection


