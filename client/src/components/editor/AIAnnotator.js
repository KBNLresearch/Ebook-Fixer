import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import styles from './Annotator.module.scss'
import { ImageInfo} from '../../helpers/EditorHelper'
import {getImgFilename} from '../../helpers/EditImageHelper'
import {  getAiAnnotation} from '../../api/AnnotateImage'


function AIAnnotator({currImage, ebookId, imageId}) {

    const generateRef = useRef(null)
    const [keywords, setKeywords] = useState([])
    let annotations = []
    useEffect(() => {
        if (!currImage) {
            generateRef.current.disabled = true
            generateRef.current.innerText = "Generated"
            
        } else {
            generateRef.current.disabled = false
            generateRef.current.innerText = "Generate"
            setKeywords([])
            
        }
    }, [currImage])

    function handleClick() {
        if (currImage) {
            // When only the client is run during development, we still want to inspect this function though
            if (!ebookId) {
                console.log('No e-book UUID stored on client!')
            }



            getAiAnnotation(
                ebookId,
                imageId,
                getImgFilename(currImage)
            ) .then(result => {
               console.log(JSON.stringify(result));
                if (Object.prototype.hasOwnProperty.call(result, "annotations")){
                        console.log(result.annotations);
                        annotations= result.annotations.map(({ text, confidence }) => (JSON.stringify({ text, confidence })))

                        console.log(annotations)

                        setKeywords(annotations)
                        console.log("ke"+ keywords)
                   }
            })
            generateRef.current.disabled = true
            generateRef.current.innerText= "Generated"
        }

    }


        return (
            <div className={styles.container}>
                <textarea value={keywords}
            placeholder="Loading AI annotation..." disabled>
            </textarea>
            <button type="button"
                    className={styles.save_button}
                    ref={generateRef}
                    onClick={() => handleClick()}>
                    Generate

            </button>
            
            </div>
        )
}

AIAnnotator.propTypes = {
    currImage: PropTypes.instanceOf(ImageInfo).isRequired,
    ebookId: PropTypes.string.isRequired,
    imageId: PropTypes.string.isRequired,
}

export default AIAnnotator