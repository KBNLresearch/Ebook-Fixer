import React, { useState } from 'react';
import styles from './Annotator.module.scss';
import { ReactComponent as SettingsSVG } from '../../assets/svgs/settings-icon.svg'

/**
 * The AI annotator component is in charge of classifying the image
 * and querying the server for a black-box AI description for it
 * 
 * @returns The AIannotator component
 */
function AIannotator() {
    return (
        <div className={styles.ai_input}>
            <textarea placeholder="Loading AI annotation..." disabled></textarea>
            <button className={styles.icon} disabled><SettingsSVG title="Settings"></SettingsSVG></button>
        </div>
    )
}

export default AIannotator;