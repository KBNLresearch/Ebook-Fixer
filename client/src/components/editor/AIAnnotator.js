import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import styles from './AIAnnotator.module.scss'
import { ImageInfo } from '../../helpers/EditorHelper'
import { ReactComponent as CopySVG } from '../../assets/svgs/copy.svg'

/**
 * The AIAnnotator handles generating AI image descriptions / labels
 * from different external APIs such as Google Vision or Microsoft Azure.
 *
 * @param {String[]} aiAnnotationList All labels/descriptions generated by the AI
 * @param {String} aiChoice The choice of AI selected by user
 * @param {String} sentence The description generated by AI
 * @param {Boolean} copied Whether or not the AI description should be copied into user box
 * @param {external: setCopied} setCopied Sets whether sentence has been copied
 * @component
 * @returns The AIAnnotator component
 */
function AIAnnotator({aiAnnotationList, aiChoice, sentence, copied, setCopied}) {

    const copyButton = useRef()
    const [cxtKeywords, setCxtKeywords] = useState([])
    const [imageAiLabs, setImageAiLabs] = useState([])

    useEffect(() => {
        if (aiAnnotationList.length > 0) {
            // Order annotation labels by confidence descendingly  
             aiAnnotationList.sort((a, b) => b.confidence - a.confidence)

             // Split AiAnnotationList into context keywords and image suggestions for currAiSelected
             const tempCxtKeywords = []
             const tempImageAiLabs = []
             aiAnnotationList.forEach((el) => {
                if (el.type === 'CXT_YAKE_LAB') {
                    tempCxtKeywords.push(el)
                } else if (el.type === aiChoice) {  // can be 'BB_GOOGLE_LAB' or 'BB_AZURE_LAB'
                    tempImageAiLabs.push(el)
                }
             })
             setCxtKeywords(tempCxtKeywords)
             setImageAiLabs(tempImageAiLabs)
             
        } else {
            console.log('No AI annotations to display')
        }
        if(copied === false && copyButton.current){
            copyButton.current.disabled = false
        }
    }, [aiAnnotationList, copied])


    /**
     * 
     * @param {Annotation object} labelObject returned by server
     * Example object:
     * confidence: "0.8987"
     *  id: 1253
     * image: 264
     * text: "Black"
     * type: "BB_GOOGLE_LAB"
     * @returns CSS classname proportional to confidence, to scale the font size
     * Uses naive string slicing
     */
    function getProportionalClass(labelObject) {
        const classes = [styles.conf_zero, styles.conf_one, styles.conf_two, styles.conf_three,
                        styles.conf_four, styles.conf_five, styles.conf_six, styles.conf_seven,
                        styles.conf_eight, styles.conf_nine, styles.conf_ten]
        const conf = labelObject.confidence
        switch(conf.charAt(2)) {
            case '0':
                if (conf.charAt(0) === '1') {
                    return classes[10]
                }
                return classes[0]
            case '1':
                return classes[1]
            case '2':
                return classes[2]
            case '3':
                return classes[3]
            case '4':
                return classes[4]
            case '5':
                return classes[5]
            case '6':
                return classes[6]
            case '7':
                return classes[7]
            case '8':
                return classes[8]
            case '9':
                return classes[9]
            default:
                return classes[0]
            } 
        }


        function handleCopy() {
            setCopied(true)
            copyButton.current.disabled=true
            
        }
    
        return (
            <div className={styles.ai_control}>
                <label htmlFor="AiLabelsBox" className={styles.box_label}> Generated labels </label>
                <div  className={styles.ai_labels_box} id="AiLabelsBox" > 
                    {imageAiLabs.slice(0, -1)
                   .map((obj) => (
                           <p className={getProportionalClass(obj)}>
                               {obj.text + ","}
                           </p>
                   ))}
                   {imageAiLabs.slice(-1)
                   .map((last) => ( 
                        <span className={getProportionalClass(last)}> {last.text} </span>
                   ))}
                </div>

                {aiChoice === 'BB_AZURE_LAB' &&
                    <div>
                        <label htmlFor="AiSentenceBox" className={styles.box_label}> <br/> Generated description </label>
                        <div className={styles.ai_labels_box} id="AiSentenceBox">
                            {sentence}
                        </div>
                        <button type='button' 
                        className={styles.copybtn}
                        ref={copyButton}
                        onClick={() => handleCopy()}>
                            <CopySVG/>
                            Copy Over
                        </button>
                    </div>}

                <label htmlFor="CxtKeywordsBox" className={styles.box_label}> <br/> Textual context keywords </label>
                <div className={styles.ai_labels_box} id="CxtKeywordsBox">
                    {cxtKeywords.slice(0, -1)
                    .map((obj) => (
                            <p className={getProportionalClass(obj)}>
                                {obj.text + ","}
                            </p>
                    ))} 
                   {cxtKeywords.slice(-1)
                   .map((last) => ( 
                        <span className={getProportionalClass(last)}> {last.text} </span>
                   ))}
                </div>
            </div>
        )
}

AIAnnotator.propTypes = {
    aiAnnotationList: PropTypes.arrayOf(PropTypes.string).isRequired,
    aiChoice: PropTypes.string.isRequired,
    sentence: PropTypes.string.isRequired,
    copied:PropTypes.bool.isRequired,
    setCopied: PropTypes.func.isRequired,
}

export default AIAnnotator
