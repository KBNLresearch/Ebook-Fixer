import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'
import { ImageInfo } from '../../helpers/EditorHelper'
import { getImgFilename } from '../../helpers/EditImageHelper'
import { getGoogleAnnotation, getMicrosoftAnnotation} from '../../api/AnnotateImage'

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
function AISelection({setStage, currAiSelected, setCurrAiSelected, setAiAnnotationList, setSentence, currImage, ebookId, imageId}) {
    
    const dropdownRef = useRef(null)
    const saveAiChoiceButtonRef = useRef(null)

    // TODO: Make the types match the ones on the server once all AI endpoints are final
    // (needed for displaying the most recent AI annotation choice in Annotator.js)
    const options = [
        {key: 'BB_GOOGLE_LAB', val: 'Google Vision'},
        {key: 'BB_AZURE_LAB', val: 'Microsoft Azure'}
    ]

    useEffect(() => {
        
        saveAiChoiceButtonRef.current.disabled = false

        if (currAiSelected != null) {
            saveAiChoiceButtonRef.current.disabled = true
            // Show the selected AI in dropdown menu
            const idx = options.findIndex(opt =>  opt.key === currAiSelected ) + 1;
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
        console.log(choice)
        setCurrAiSelected(choice)


        if (choice !== 'Invalid') {
            
            display(choice)
            saveAiChoiceButtonRef.current.disabled = true
            saveAiChoiceButtonRef.current.innerText = 'Generated'
            

        } else {
            saveAiChoiceButtonRef.current.disabled = false
        } 
    }

    function handleSkip() {
        setCurrAiSelected("skipped")
        setStage("annotate")
    }

     /**
     * Makes API call to server for fetching AI annotations
     * and disables "Generate" button
     */
      function display(choice) {
        if (currImage) {
            
            // When only the client is run during development, we still want to inspect this function though
            if (!ebookId) {
                console.log('No e-book UUID stored on client!')
            }

            switch(choice) {
                case 'BB_GOOGLE_LAB':
                    // Loading spinner while user waits for AI annotations
                    setStage('loading')
                    console.log('Fetching Google Vision labels...')
                     getGoogleAnnotation(
                    ebookId,
                    imageId,
                    getImgFilename(currImage)
                ) .then(result => {
                    setStage("annotate")
                    if (Object.prototype.hasOwnProperty.call(result, "annotations")){ 
                        // Order annotation labels by confidence ascendingly  
                        setAiAnnotationList(result.annotations)
                       }
                })
                break

                case 'BB_AZURE_LAB':
                    // Loading spinner while user waits for AI annotations
                    setStage('loading')
                    console.log('Fetching Microsoft Azure labels and description...')
                    getMicrosoftAnnotation(
                        ebookId,
                        imageId,
                        getImgFilename(currImage)
                    ) .then(result => {
                        setStage('annotate')
                        if (Object.prototype.hasOwnProperty.call(result, "annotations")){
                                setSentence(result.annotations.pop().text)
                                // Order annotation labels by confidence ascendingly
                                setAiAnnotationList(result.annotations)
                           }
                    })
                    break
                
                default :
                   
            }
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
                <option value={opt.key} key={opt.key}> {opt.val} </option>
            ))}
        </select>
        
        <div>
        <button
            type="button"
            className={styles.save_button}
            ref={saveAiChoiceButtonRef}
            onClick={() => handleAiClick()}>
            {' '}
            Generate Suggestions{' '}
        </button>
        <button
            type="button"
            className={styles.skip}
            onClick={() => handleSkip()}
            >
            {' '}
            Skip{' '}
        </button>
        </div>
        </div> 
    )
}

AISelection.propTypes = {
    setStage: PropTypes.func.isRequired,
    currAiSelected: PropTypes.string.isRequired,
    setCurrAiSelected: PropTypes.func.isRequired,
    setAiAnnotationList: PropTypes.func.isRequired,
    setSentence: PropTypes.func.isRequired,
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
}

export default AISelection


