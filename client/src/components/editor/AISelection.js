import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'

/**
 * 
 * @param {*} param0 
 * @returns 
 */
function AISelection({setStage, setAiSaved}) {

    const dropdownRef = useRef(null)
    const saveAiChoiceButtonRef = useRef(null)

    const options = [
        {abr: 'GOOGL', val: 'Google Vision API'},
    ]


    function handleAiClick() {
        setStage("annotate")
        setAiSaved(true)
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
                // TODO: handle AI selected by user (put this whole div in another component)
                // handleMenuOption(ospt)
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
    setAiSaved: PropTypes.func.isRequired
}

export default AISelection


