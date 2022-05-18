/**
 * @param {Object} image: metadata of currently being annotated image
 * @returns the filename of the classifiesd image
 * For example: "2874324973610680654_cover.jpg"
 */
export function getImgFilename(image) {
    const currImageName = image.asset.href
    return currImageName
}

/**
 * @param {Object} image: metadata of currently being annotated image
 * @returns the HTML filename in which the image occurs
 * For example: 568395898401760676_31979-h-0.htm.html
 */
export function getLocation(image) {
    const currHTMLFile = image.section.href
    return currHTMLFile
}

/** TODO: Extract raw context (for AI annotation generation on server?)
 * But this may not be necessary, since server has access to HTML file too
 * @param {Object} image: metadata of currently being annotated image
 * @returns the raw context of the image, which is an optional field on the server.
 */
export function getRawContext(image) {
    return 'RAW CONTEXT'
}
