/**
 * makes a get request to get the file with given id from the server
 *
 * @category API
 * @param {String} fileId
 * @returns the file as a blob
 * @throws error if the file is not found
 * @see Server Documentation for description of request & response
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
        .then((response) => response)
        .catch((error) => {
            throw error
        })
}
