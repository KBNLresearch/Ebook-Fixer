/**
 * sends a POST request to server to save the annotation made by the user
 * @param {String} ebookId id of ebook in database
 * @param {String} imageId id of image in database
 * @param {String} filen file name of image
 * @param {String} txt that user typed
 * @returns response to the request
 */

export function saveUserAnnotation(ebookId, imageId, fileName, txt) {
    return fetch(process.env.REACT_APP_API_URL + 'annotations/save/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ebook: ebookId,
            id: imageId,
            filename: fileName,
            text: txt,
        }),
    })
        .then((res) => res.json()) // if it's in json format
        .then(
            (result) => {
                console.log(result)
                return result
            },
            // Error handling
            (error) => {
                window.alert('error! Please try again.')
                console.log(error)
                throw error
            }
        )
}


export function  getAiAnnotation(ebookId, imageId, fileName) {
    console.log("imageid" + imageId)
    console.log("file"+ fileName)
    return fetch(process.env.REACT_APP_API_URL + 'annotations/generate/', {
        method: 'PUT',
        headers: {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
            "id" : imageId,
            "ebook" : ebookId,
            "filename": fileName
        })
    }).then(res => res.json()) // if it's in json format
      .then(
          (result) => {
            console.log(result);
            return result
        },
        // Error handling
          (error) => {
            window.alert(
                "error! Please try again."
            )
            console.log(error);
            throw error;
        }
      )

}
