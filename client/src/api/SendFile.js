/**
 * This calls the server API to upload the submitted epub file.
 *
 * @param {FormData} file The file which is put in a FormData container so that it can be sent like a form.
 * @returns The parsed JSON response if the response was OK (code 2xx),
 *          Or the error that was thrown (if the response is an error code).
 */
export function sendFile(file) {
    return fetch(process.env.REACT_APP_API_URL + 'ebooks/upload/', {
        method: 'POST',
        body: file,
    })
        .then((response) => {
            if (response.ok) {
                return response.json()
            }
            throw new Error(
                response.status + ', message: ' + response.statusText
            )
        })
        .then(function (response) {
            console.log('Response: ')
            console.log(response)
            return response
        })
        .catch((error) => {
            console.log(error)
            throw error
        })
}
