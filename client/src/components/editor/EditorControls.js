import React from 'react';

/**
 * The controls for the editor
 * Right now these are a bunch of buttons that scroll pictures from the book into view
 * These are passed as children via props
 * 
 * @param {{children: The children of the component passed from the parent}} props The props of this component
 * @returns The EditorControls component
 */
function EditorControls(props) {

    return (
        <div>
            {props.children}
        </div>
    )
}

export default EditorControls;