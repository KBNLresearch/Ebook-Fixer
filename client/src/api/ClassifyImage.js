// PUT request to server:
// Body payload:
    // {
    //     "ebook": "0133cce7-eace-44c9-95cc-d5b806f18a88",
    //     "filename": "5934001519532275538_cover.jpg",
    //     "location": "wrap0000.html",
    //     "classification": "Decorative",
    //     "raw_context": "RAW CONTEXT"
    // }

/**
 * makes a PUT request to classify an image in an existing/uploaded ebook
 * @param {*} ebook_uuid: 
 * @param {*} filename: 
 *           
 * @returns  response
 */
 export function classifyImageApiCall(ebook_uuid, filename, location, classification, raw_context) {
    return fetch("http://localhost:8000/images/classify/")
      //.then(res => res.text()) // for the raw data
      .then(res => res.json()) // if it's in json format
      .then(
          (result) => {
            console.log(result);
            return result
        },
        // Error handling vvv
          (error) => {
            console.log(error);
            throw error;
        }
      )
  }