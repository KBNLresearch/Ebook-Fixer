
// {
//         "ebook": "5a94ef04-a660-4b64-99f1-7b91813d0ffe",
//         "id": 1,
//         "filename": "8517446252668873626_i_frontispiece1.jpg",
//         "text": "NEW TEXT"
//       }
//


export function  saveUserAnnotation(ebookId, imageId, filen, txt) {
    console.log(JSON.stringify({
            "ebook" : ebookId,
            "id" : imageId,
            "filename": filen,
            "text": txt
        }))
    return fetch(process.env.REACT_APP_API_URL+'annotations/save/', {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "ebook" : ebookId,
            "id" : imageId,
            "filename": filen,
            "text": txt
        })
    }).then(res => res.json()) // if it's in json format
      .then(
          (result) => {
            console.log(result);
            return result
        },
        // Error handling
          (error) => {
            window.alert("Image classification error! Please try again.")
            console.log(error);
            throw error;
        }
      )

}
