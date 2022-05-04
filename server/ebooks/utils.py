from bs4 import BeautifulSoup
import zipfile
import uuid 
import os
import shutil
from os.path import basename
from pathlib import Path  


def inject_image_annotations(html_files, images, annotations):
    for image in images:
        try:
            image_annotation = filter(lambda a: a.image == image, annotations).__next__()
            html_file = filter(lambda h: h.path == image.location, html_files).__next__()
        except StopIteration:
            pass
        else:
            html_content = open(html_file)
            data = BeautifulSoup(html_content, 'html.parser')
            images_in_html = data.find_all('img', src=True)
            for im in images_in_html:
                if im['src'] == image.filename:
                    im['alt'] = image_annotation

            with open(html_file, "w") as file:
                file.write(str(data))
  

def unzip_epub(epub_path, output_path):
    with zipfile.ZipFile("server/test-books/pg67973-images.epub", 'r') as zip_ref:
        id = str(uuid.uuid4())
        os.mkdir(id)
        zip_ref.extractall(f"{output_path}\{id}")

#unzip_epub("server/test-books\pg67973-images.epub", "server/test-books")

# Assumes that there is an unzipped epub at test-books/ 
# Zips the ebook with that uuid and returns the path for the zipped epub
def zip_ebook(ebook_uuid):
    zipFileName = f"test-books/{ebook_uuid}.zip"
    print(f"DEBUGGG:{zipFileName}")
    with zipfile.ZipFile(zipFileName, 'w') as zipObj:
        # Iterate over all the files in directory
        for folderName, subfolders, filenames in os.walk("test-books/{ebook_uuid}"):
            for filename in filenames:
                #create complete filepath of file in directory
                filePath = os.path.join(folderName, filename)
                # Add file to zip
                zipObj.write(filePath, basename(filePath))

    # Changing extention to .epub
    p = Path(zipFileName)
    p = p.rename(p.with_suffix('.epub'))
    
    return p

#zip_ebook("5fc6858c-270e-4454-9c39-97ba73c20a47")


