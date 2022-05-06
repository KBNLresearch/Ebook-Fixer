from bs4 import BeautifulSoup
from pathlib import Path
import shutil
import zipfile


def inject_image_annotations(ebook_uuid, html_filenames, images, annotations):
    storage_path = f"test-books/{ebook_uuid}/OEBPS/"
    for image in images:
        try:
            image_annotation = filter(lambda a: a.image == image, annotations).__next__()
            html_file = filter(lambda h: h == image.location, html_filenames).__next__()
        except StopIteration:
            pass
        else:
            try:
                html_content = open(storage_path + html_file)
                data = BeautifulSoup(html_content, 'html.parser')
                images_in_html = data.find_all('img', src=True)
                for im in images_in_html:
                    # print(im)
                    # print(image.filename)
                    if im['src'] == image.filename:
                        im['alt'] = image_annotation.text

                with open(storage_path + html_file, "w") as file:
                    file.write(str(data))
            except FileNotFoundError:
                pass


# Assumes that there is an unzipped epub at test-books/
# Zips the ebook with that uuid and returns the path for the zipped epub
def zip_ebook(ebook_uuid):
    path_name = f"test-books/{ebook_uuid}/"
    zipfile_name = shutil.make_archive(ebook_uuid, 'zip', path_name)
    path = Path(zipfile_name)
    path = path.rename(path.with_suffix('.epub'))
    return path


# Assumes the zipped epub file is stored under MEDIA_ROOT/test-books/{uuid}/{filename}
# Unzips the epub file, now under MEDIA_ROOT/{uuid}
def unzip_ebook(ebook_uuid, ebook_filename):
    with zipfile.ZipFile(f"/app/test-books/{ebook_uuid}/{ebook_filename}", 'r') as zipped_epub:
        zipped_epub.extractall(f"/app/test-books/{ebook_uuid}")
