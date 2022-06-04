import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ImageInfo } from '../../helpers/EditorHelper'
import AIAnnotator from './AIAnnotator'
import UserAnnotator from './UserAnnotator'
import Classifier from './Classifier'
import AISelection from './AISelection'
import { getImgFilename } from '../../helpers/EditImageHelper'
import { getImageMetadataApiCall } from '../../api/GetImageMetadata'
import styles from './Annotator.module.scss'
import ProgressBar from './ProgressBar'

/**
 * The Annotator component is meant to help the user produce an annotation for an image as an end result
 * It keeps track of the different stages in the image annotation process (classify, ai, manual, save)
 *
 * @param {ImageInfo} currImage Metadata for current image under annotation
 * @param {String} ebookId The UUID for the ebook generated by server
 * @component
 * @returns The Annotator Component: different view depending on the stage
 */

function Annotator({ currImage, ebookId }) {
    const [stage, setStage] = useState(null)
    const [imageId, setImageId] = useState(-1)
    const [existingAltText, setExistingAltText] = useState(null)

    const [currClassification, setCurrClassification] = useState(null)
    const [currAiSelected, setCurrAISelected] = useState(null)
    // TODO: could be used to get the annotation history
    const [aiAnnotationList, setAiAnnotationList] = useState([])
    const [userAnnotationList, setUserAnnotationList] = useState([])
    const [sentence, setSentence] = useState(null)

    // Executed every time the currentImage changes
    useEffect(() => {
        // Note that this start stage is overidden by the image overview
        if (!currImage) {
            setStage('loading')
        } else {
            setStage('classify')
            // Remove all AI suggestions when next image is loaded
            setCurrClassification(null)
            setCurrAISelected(null)
            setAiAnnotationList([])
            setUserAnnotationList([])
            setSentence(null)

            // Save existing alt-text of image
            const altText = currImage.element.alt
            if (altText) {
                setExistingAltText(altText)
            }
            // For each image that is loaded, client fetches all metadata from server (even if the image does not exist yet)
            fetchImageMetadata()
        }
    }, [currImage])

    /**
     * Makes API call to server for fetching image metadata
     * i.e. the image itself and all annotations linked to it
     * and updates state accordingly
     */
    function fetchImageMetadata() {
        // As the user is waiting for the server's response
        setStage('loading')

        console.log('Fetching image metadata...')

        getImageMetadataApiCall(ebookId, getImgFilename(currImage)).then(
            (result) => {
                setStage('overview')
                if (
                    Object.prototype.hasOwnProperty.call(result, 'annotations')
                ) {
                    console.log('Annotations: ')
                    console.log(result.annotations)

                    // Decorative images don't have image descriptions
                    if (currClassification !== 'Decoration') {
                        setStage('overview')
                    }
                    // For each HUM annotation, add to user annotation list (for display in UserAnnotator)
                    // Note that for now this list always contains 1 HUM annotation
                    result.annotations.forEach((el) => {
                        if (el.type === 'HUM') {
                            setUserAnnotationList([
                                ...userAnnotationList,
                                el.text,
                            ])
                        }
                    })
                    // TODO: use timestamp of annotation?
                    const allAiLabels = result.annotations.filter(
                        (el) => el.type !== 'HUM'
                    )
                    if (allAiLabels.length > 0) {
                        const mostRecentAiChoice = allAiLabels[allAiLabels.length - 2].type
                        console.log(mostRecentAiChoice)
                        console.log(currAiSelected)
                        if (currAiSelected != mostRecentAiChoice) {
                            // To display most recently selected AI in dropdown
                            // TODO: either use key or value of AI choice (now we use both)
                            setCurrAISelected(mostRecentAiChoice)   
                            console.log(currAiSelected)                         
                            // To display most recently generated AI description
                            if ( mostRecentAiChoice === 'BB_AZURE_LAB'){
                                setSentence(allAiLabels.pop().text)
                            }
                             // To display most recently generated AI suggestions when revisiting image
                            setAiAnnotationList(allAiLabels)
                        }
                    }
                }

                if (Object.prototype.hasOwnProperty.call(result, 'image')) {
                    console.log('Image metadata: ')
                    console.log(result.image)
                    setImageId(result.image.id)
                    setCurrClassification(result.image.classification)
                }
            },
            (error) => {
                if (error.cause === 404) {
                    setStage('classify')
                    console.log(
                        'Image does not exist on server yet, will be created after the first time classifying.'
                    )
                    setCurrClassification(null)
                }
            }
        )
    }

    return (
        <div className={styles.container}>
            <ProgressBar
                currStage={stage}
                setStage={setStage}
                classification={currClassification}
                userAnnotations={userAnnotationList}
                currAiSelected={currAiSelected}
            />

            {
                {

                'loading': 
                    <div className={styles.loader}> Loading... </div>,

                'classify': 
                    <Classifier
                        currImage={currImage}
                        ebookId={ebookId}
                        setImageId={setImageId}
                        currClassification={currClassification}
                        setCurrClassification={setCurrClassification}
                        setStage={setStage}>
                        {' '}
                    </Classifier>,

                'ai-selection':
                   <AISelection 
                        setStage={setStage}
                        currAiSelected={currAiSelected}
                        setCurrAiSelected={setCurrAISelected}
                        setAiAnnotationList={setAiAnnotationList}
                        setSentence={setSentence}
                        currImage={currImage}
                        ebookId={ebookId}
                        imageId={imageId} 
                    />,
                
                'annotate': 
                    <div className={styles.container}>
                        {currAiSelected !='skipped' &&
                            <AIAnnotator
                            aiAnnotationList={aiAnnotationList}
                            setAiAnnotationList={setAiAnnotationList}
                            currImage={currImage}
                            ebookId={ebookId}
                            imageId={imageId} 
                            aiChoice={currAiSelected}
                            sentence={sentence}
                            setSentence={setSentence}
                            setStage={setStage}
                        >
                            {' '}
                        </AIAnnotator>}
                        <UserAnnotator 
                            annotationList={userAnnotationList} 
                            setAnnotationList={setUserAnnotationList}
                            currImage={currImage}
                            ebookId={ebookId}
                            imageId={imageId}
                            setImageId={setImageId}
                            existingAlt={existingAltText}
                            setStage={setStage}
                            />
                        </div>
                    ,

                    overview: (
                        <div className={styles.overview}>
                            <div className={styles.overview_info}>
                                <br />
                                <strong> Classification: </strong>{' '}
                                {currClassification}
                                <br />
                            </div>
                            <div className={styles.overview_info}>
                                <strong> Image description: </strong>
                                {
                                    userAnnotationList[
                                        userAnnotationList.length - 1
                                    ]
                                }
                            </div>
                            <button
                                type="button"
                                className={styles.restart_button}
                                onClick={() => {
                                    setStage('classify')
                                    setCurrClassification(null)
                                    setCurrAISelected(null)
                                    setAiAnnotationList([])
                                    setUserAnnotationList([])
                                }}>
                                Restart image annotation
                            </button>
                        </div>
                    ),
                }[stage]
            }
        </div>
    )
}

Annotator.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
}

export default Annotator
