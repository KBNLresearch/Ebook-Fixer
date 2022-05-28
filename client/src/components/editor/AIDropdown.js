import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'
import { classifyImageApiCall } from '../../api/ClassifyImage'
import { ImageInfo } from '../../helpers/EditorHelper'
import {
    getImgFilename,
    getLocation,
    getRawContext,
} from '../../helpers/EditImageHelper'

function AIDropdown({ currImage, ebookId, setImageId, aiChoice, setAiChoice, setStage }) {

    const saveButtonRef = useRef(null)
    const dropdownRef = useRef(null)
 const options = [
        {abr: 'GOOGL', val: 'Google Vision API'},
        {abr: 'MICRO' , val: 'Microsoft Azure API'}
    ]
    return(
        <div className={styles.ai_input}>

                        <label htmlFor="selectClass">
                            Please select AI to generate annotations
                        </label>
                        <select
                           
                            ref={dropdownRef}
                            className={styles.dropdown}
                            onChange={() => {
                                saveButtonRef.current.disabled = false
                            }}>
                            <option value="none" selected disabled hidden>
                                Select AI
                            </option>
                            {options.map((opt) => (
                                <option value={opt.abr}> {opt.val} </option>
                                // TODO: handle AI selected by user
                                // handleMenuOption(ospt)
                            ))}
                        </select>
                        <button
                            type="button"
                            className={styles.save_button}
                            ref={saveButtonRef}
                            onClick={() => {
                                
                                setAiChoice(dropdownRef.current
                                    .options[dropdownRef.current.selectedIndex]
                                    .value)
                                console.log(dropdownRef.current
                                    .options[dropdownRef.current.selectedIndex]
                                    .value)
                                setStage("annotate")
                            }}>
                            {' '}
                            Save AI{' '}
                        </button>
                        
                    </div>
    )
}
AIDropdown.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    setImageId: PropTypes.func.isRequired,
    aiChoice: PropTypes.string.isRequired,
    setAiChoice: PropTypes.func.isRequired,
    setStage: PropTypes.func.isRequired,
 
}

export default AIDropdown