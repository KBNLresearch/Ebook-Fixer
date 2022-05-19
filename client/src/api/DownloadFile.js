/**
 * makes a get request to get the file with given id to download from the server
 * @param {String} fileId
 * @returns  response
 */
export function getFile(fileId) {
    return fetch(
        process.env.REACT_APP_API_URL + 'ebooks/download/' + fileId + '/',
        {
            method: 'GET',
        }
    )
        .then((response) => {
            if (response.ok) {
                response.blob().then((blob) => {
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = fileId + '.epub'
                    a.click()
                })
            }
        })
        .then((response) => {
            console.log('Response: ')
            console.log(response)
            return response
        })
        .catch((error) => {
            window.alert(
                'Error in fetching ebook for download! Please try again.'
            )
            console.log(error)
            throw error
        })
}
