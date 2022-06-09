import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import styles from './Annotator.module.scss'
import { ImageInfo } from '../../helpers/EditorHelper'
import { getImgFilename } from '../../helpers/EditImageHelper'
import { getGoogleAnnotation, getMicrosoftAnnotation, getYakeContextKeywords } from '../../api/AnnotateImage'
import { ReactComponent as MoreInfoSVG } from '../../assets/svgs/information-button.svg'

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
function AISelection({setStage, currAiSelected, setCurrAiSelected, aiAnnotationList, setAiAnnotationList, setSentence, currImage, ebookId, imageId}) {
    
    const dropdownRef = useRef(null)
    const generateButtonRef = useRef(null)
    const savedTextButton = "Generated"
    const notSavedTextButton = "Get AI suggestions"
    const [moreInfo, setMoreInfo] = useState(false);

    const extraContent = <div>
      <p className="extra-content" style={{fontSize : '16px'}}>
          <p>
            Google Cloud Vision API: generates image labels with a corresponding confidence.
            Best used for flags, covers, text and logos.
        </p>
        <br/>
        <p>
            Microsoft Computer Vision: generates image labels with a corresponding confidence as well as a sentence describing the image.
            Best used for art, drawings, icons and photographs.
        </p>

      </p>
  </div>

    // TODO: Make the types match the ones on the server once all AI endpoints are final
    // (needed for displaying the most recent AI annotation choice in Annotator.js)
    const options = [
        {key: 'BB_GOOGLE_LAB', val: 'Google Vision'},
        {key: 'BB_AZURE_LAB', val: 'Microsoft Azure'}
    ]

    useEffect(() => {

        // TODO: split AIAnnotations into context keywords and image suggestions
        
        generateButtonRef.current.disabled = false

        if (currAiSelected !== null && currAiSelected !== 'skipped') {
            generateButtonRef.current.disabled = true
            generateButtonRef.current.innerText = savedTextButton
            // Show the selected AI in dropdown menu
            const idx = options.findIndex(opt =>  opt.key === currAiSelected ) + 1;
            dropdownRef.current.selectedIndex = idx;
        } else {
            // Show the label
            dropdownRef.current.selectedIndex = 0
            generateButtonRef.current.disabled = false
            generateButtonRef.current.innerText = notSavedTextButton
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
            
            display(choice)
            generateButtonRef.current.disabled = true
            generateButtonRef.current.innerText = savedTextButton

        } else {
            generateButtonRef.current.disabled = false
            generateButtonRef.current.innerText = notSavedTextButton
        } 
    }

    function handleSkip() {
        // TODO: Also show textual keywords when AI skipped?
        // Currently this is kinda hard cause the whole AIAnnotator component is disabled when skipped
        // getYakeKeywords()
        setCurrAiSelected("skipped")
        setStage("annotate")
    }

     /**
     *  Gets Yake keywords
     *  Gets AI suggestions for image annotations, depending on the user's AI choice
     */
      function display(choice) {
        if (currImage) {
            
            // When only the client is run during development, we still want to inspect this function though
            if (!ebookId) {
                console.log('No e-book UUID stored on client!')
            }
            let currImageAiSuggestions = null
            // Each of these helpers also gets Yake keywords, which are appended to the list of image AI suggestions
            switch(choice) {
                case 'BB_GOOGLE_LAB':
                    getGoogleAnnotations()
                    break
                case 'BB_AZURE_LAB':
                    getMsAnnotations()
                    break
                default:
                    // TODO: proper handling of no matching AI choice
            }
        }
    }


    /**
     * Makes API call to server for fetching Google labels
     */
    function getGoogleAnnotations() {
        // Loading spinner while user waits for AI annotations
        setStage('loading')
        console.log('Fetching Google Vision labels...')
        let res = null
        getGoogleAnnotation(
            ebookId,
            imageId,
            getImgFilename(currImage)
        ) .then(result => {
            setStage("annotate")
            if (Object.prototype.hasOwnProperty.call(result, "annotations")){ 
                setAiAnnotationList(result.annotations)
                // Appends context keywords generated by Yake to black box annotations
                getYakeKeywords(result.annotations)
            }
        })
    }

    /**
     * Makes API call to server for fetching MS labels and descriptions
     */
    function getMsAnnotations() {
        setStage('loading')
        console.log('Fetching Microsoft Azure labels and description...')
        let res = null
        getMicrosoftAnnotation(
            ebookId,
            imageId,
            getImgFilename(currImage)
        ) .then(result => {
            setStage('annotate')
            if (Object.prototype.hasOwnProperty.call(result, "annotations")){
                    setSentence(result.annotations.pop().text)
                    setAiAnnotationList(result.annotations)
                    // Appends context keywords generated by Yake to black box annotations
                    getYakeKeywords(result.annotations)
            }
        })
    }

    /**
     * Makes API call to server for fetching Yake keywords
     */
    function getYakeKeywords(generatedAiImageSuggestions) {
        setStage('loading')
        console.log('Fetching Yake context keywords...')
        getYakeContextKeywords(
            ebookId,
            imageId,
            getImgFilename(currImage)
        ) .then(result => {
            setStage('annotate')
            if (Object.prototype.hasOwnProperty.call(result, "annotations")){
                // Add Yake keywords to already existing list of AI annotations (by Google or MS)
                const allAiGenerations = generatedAiImageSuggestions
                result.annotations.forEach((el) => {
                    allAiGenerations.push(el)
                })  
                // Combines all black box AI suggestions and context keywords
                setAiAnnotationList(allAiGenerations)
                }
        })
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
                    generateButtonRef.current.disabled = false
                    generateButtonRef.current.innerText = notSavedTextButton
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
            <button
                    type="button"
                    className={styles.moreinfobtn}
                    onClick={() => setMoreInfo(!moreInfo)}
                    >
                    <MoreInfoSVG />       
                </button>
            <div>
                {moreInfo ? extraContent: ""}
            </div>
            <div>
            <button
                type="button"
                className={styles.save_button}
                ref={generateButtonRef}
                onClick={() => handleAiClick()}>
                {notSavedTextButton}
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
    aiAnnotationList: PropTypes.func.isRequired,
    setAiAnnotationList: PropTypes.func.isRequired,
    setSentence: PropTypes.func.isRequired,
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
}

export default AISelection


