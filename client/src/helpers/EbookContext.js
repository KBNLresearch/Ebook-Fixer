import { atom } from 'jotai'

// This file contains context that will be available globally for all components to use.
// For a tutorial on using jotai: https://jotai.org/ (it's pretty intuitive)

/**
 * Will be set to the function for changing to the next image.
 * null if there is no next image
 * @private
 */
export const nextImage = atom(null)

export const titleContext = atom('')
