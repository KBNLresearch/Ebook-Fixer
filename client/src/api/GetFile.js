/**
 * makes a get request to get the file with given id from the server
 * @param {String} fileId
 * @returns the file as a blob
 * @throws error if the file is not found
 */
export function getFileBlob(fileId) {
    return fetch(
        process.env.REACT_APP_API_URL + 'ebooks/download/' + fileId + '/',
        {
            method: 'GET',
        }
    )
        .then((response) => {
            if (response.ok) {
                // console.log(response.status)
                return response.blob()
            }
            throw new Error('Response code: ' + response.status)
        })
        .then((response) => {
            console.log('Responseaaa: ')
            // console.log(response)
            return response
        })
        .catch((error) => {
            // window.alert('Error!' + error.message)
            // console.log(error)
            throw error
        })
}
