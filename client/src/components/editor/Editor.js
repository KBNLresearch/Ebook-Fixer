import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs'
import Viewer from './Viewer';
import EditorControls from './EditorControls';
import styles from './Editor.module.css'

function Editor(props) {

    let reader;

    var rendered = false;

    if (window.FileReader) {
        reader = new FileReader();
        reader.onload = openBook;
    }

    const viewerId = "epubviewer";


    const [imageList, setImageList] = useState([])



    function getImagesOnScreen(contents, view) {

        const resources = view.book.resources.replacementUrls.map((v, i) => {return {index: i, replacementUrl: v, asset: view.book.resources.assets[i]}});

        const imageResources = resources.filter(resource => {
            return resource.asset.type.startsWith('image')
        })

        let elements = contents.document.querySelectorAll('img');

        setImageList(Array.prototype.map.call(elements, e => {
            let src = e.src;

            let resource = imageResources.find(res => {
                return res.replacementUrl === src;
            })

            if (resource) {
                let imageFileName = resource.asset.href;

                if (!e.id) {
                    e.id = imageFileName
                }
                return { element: e, imageFileName: imageFileName };
                
            }
        }));
    }

    function openBook(e){
        var bookData = e.target.result;

        let book = ePub();
        let rendition;

        book.open(bookData);

        document.getElementById(viewerId).textContent = ''; 

        if (rendered) return;
        rendered = true;


        rendition = book.renderTo(viewerId, {
            flow: "scrolled",
            manager: "continuous",
            // layout: "pre-paginated",
            width: "100%",
            height: 600
        });
        
        rendition.display();

        rendition.hooks.content.register(getImagesOnScreen)
    }

    useEffect(() => {
        if (window.FileReader) {
            var reader = new FileReader();
            reader.onload = openBook;
            reader.readAsArrayBuffer(props.ebookFile);
        }
    }, [])

    
    
    return (
        <div>
            <h1 className={styles.title}>Editor</h1>
            <div className={styles.editor}>
            <EditorControls>{imageList.map(img => {
                return <button key={img.imageFileName} onClick={() => { img.element.scrollIntoView() }}>Scroll {img.imageFileName} into view</button>
            })}</EditorControls>
            <Viewer id={viewerId}></Viewer>
            </div>
        </div>
    )
}

export default Editor;