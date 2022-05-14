export function fetchExampleApiCall() {
    return (
        fetch(process.env.REACT_APP_API_URL + 'api/ebooks/')
            //.then(res => res.text()) // for the raw data
            .then((res) => res.json()) // if it's in json format
            .then(
                (result) => {
                    console.log(result)
                    return result
                },
                // Error handling vvv
                (error) => {
                    console.log(error)
                    throw error
                }
            )
    )
}
