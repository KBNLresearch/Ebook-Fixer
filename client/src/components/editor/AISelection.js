import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'

/**
 * 
 * @param {*} param0 
 * @returns 
 */
function AISelection({setStage, currAiSelected, setCurrAiSelected, setAiSaved}) {
    
    const dropdownRef = useRef(null)
    const saveAiChoiceButtonRef = useRef(null)

    const options = [
        {abr: 'GG', val: 'Google Vision API'},
        {abr: 'MS', val: 'Microsoft Azure Vision API'}
    ]

    useEffect(() => {
        
        saveAiChoiceButtonRef.current.disabled = false

        if (currAiSelected != null) {
            saveAiChoiceButtonRef.current.disabled = true
            // Show the selected AI in dropdown menu
            const idx = options.findIndex(opt => opt.val === currAiSelected) + 1;
            dropdownRef.current.selectedIndex = idx;
        } else {
            // Show the label
            dropdownRef.current.selectedIndex = 0
        }

    }, [])



    function getSelectedAi() {
        const choice =  dropdownRef.current.options[dropdownRef.current.selectedIndex].value
        if (dropdownRef.current.selectedIndex === 0) {
            window.alert('This option is not allowed!')
            return 'Invalid'
        }
        return choice   
    }


    function handleAiClick() {

        setCurrAiSelected(getSelectedAi())





         // TODO: pass selectedAi to AIAnnotator (via parent), which will make API call depending on the selected AI

         // TODO: enable generate button in next stage again, when new AI is selected





        if (currAiSelected !== 'Invalid') {
            saveAiChoiceButtonRef.current.disabled = true
            saveAiChoiceButtonRef.current.innerText = 'AI saved'
            setStage('annotate')
            setAiSaved(true)
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
    setCurrAiSelected: PropTypes.func.isRequired,
    setAiSaved: PropTypes.func.isRequired
}

export default AISelection


