/**
 * Makes a GET request to classify an image in an existing/uploaded ebook
 *
 * @category API
 * @param {String} ebookUuid: UUID of ebook under edit, generated by server upon upload
 * @returns  response by server
 * @throws Error if the ebook is not found
 * @see Server Documentation for description of request & response
 */
export function getImagesOverview(ebookUuid) {
    return new Promise((resolve, reject) => {
        resolve([
            {
                filename: '/EPUB/images/moon-images/1.new-moon.jpg',
                annotation: 'a',
            },
            {
                filename: '/EPUB/images/moon-images/4.waxing-gibbous.jpg',
                classification: 'Decoration',
            },
        ])
    })
    /* 
    fetch(
        // Encoding of URI component allows for encoding of chars such as /, ?, =, &
        // Some image filenames have a path such as images/hoof001ware10ill0001.gif
        process.env.REACT_APP_API_URL + 'ebooks/getImages/',
        // + encodeURIComponent(filename)
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                ebook: ebookUuid,
            },
        }
    )
        .then((response) => {
            if (response.ok) {
                return response.json()
            }
            throw new Error('Failed to fetch ', {
                cause: 404,
            })
        })
        .then(
            (result) => result,
            (error) => {
                throw error
            }
        )
        */
}
