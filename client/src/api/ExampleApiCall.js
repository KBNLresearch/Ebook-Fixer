/**
 * An example API call for developers to use
 * @private
 * @category API
 */
export function fetchExampleApiCall() {
    return fetch(process.env.REACT_APP_API_URL + 'api/ebooks/')
        .then((response) => {
            if (response.ok) {
                // if it's in json format
                return response.json()
            }
            throw new Error('Response code: ' + response.status)
        })
        .then(
            (result) => result,
            // Error handling
            (error) => {
                throw error
            }
        )
}
