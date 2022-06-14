/**
 * Makes a get request to get the file with given id to download from the server
 *
 * @category API
 * @param {String} fileId The ID of the file to download
 * @returns  response from the server
 * @see Server Documentation for description of request & response
 */
export function getFile(fileId) {
    return fetch(
        process.env.REACT_APP_API_URL +
            'ebooks/download/' +
            fileId +
            '/?' +
            new URLSearchParams({
                inject: 'true',
            }),
        {
            method: 'GET',
        }
    )
        .then((response) => {
            if (response.ok) {
                return response.blob()
            }
            throw Error('Cannnot download the ebook')
        })
        .then((response) => response)
        .catch((error) => {
            window.alert(
                'Error in fetching ebook for download! Please try again.'
            )
            console.log(error)
            throw error
        })
}
