import os
import shutil
import subprocess

from bs4 import BeautifulSoup
from epubcheck import EpubCheck
from pathlib import Path
from zipfile import ZipFile


def inject_image_annotations(ebook_uuid, images, annotations):
    """ Injects all human image annotations to their corresponding ALT-texts in the HTML files.

        Args:
            ebook_uuid (String): uuid of ebook
            images (List[Image]): all images in that ebook
            annotations (List[Annotation]): all human annotations for the images
    """
    storage_path = f"test-books/{ebook_uuid}"
    for image in images:
        try:
            image_annotation = filter(lambda a: a.image == image, annotations).__next__()
        except StopIteration:
            pass
        else:
            try:
                html_file = image.location
                html_content = open(storage_path + html_file)
                data = BeautifulSoup(html_content, 'html.parser')
                images_in_html = data.find_all('img', src=True)
                for im in images_in_html:
                    basename = os.path.basename(image.filename)
                    if str(im['src']).endswith(basename):
                        im['alt'] = image_annotation.text

                with open(storage_path + html_file, "w") as file:
                    text = data.prettify()
                    text = add_indentation(text, 3)
                    file.write(text)
            except FileNotFoundError:
                pass


def add_indentation(text, indentation):
    """ Adds new spaces at the start of each new line in the text.

    Args:
        text (String): the text to which we should add indentation
        indentation (Int): the number of spaces to be added to each line

    Returns:
        Text: the text with indentation
    """
    sp = " " * indentation
    lsep = chr(10) if text.find(chr(13)) == -1 else chr(13) + chr(10)
    lines = text.split(lsep)
    for i in range(len(lines)):
        space_diff = len(lines[i]) - len(lines[i].lstrip())
        if space_diff:
            lines[i] = sp * space_diff + lines[i]
    return lsep.join(lines)


def zip_ebook(ebook_uuid):
    """ Assumes that there is an unzipped epub at test-books/{ebook_uuid}.
    Zips the ebook with that uuid and returns the path to the zipped epub.

    Args:
        ebook_uuid (String): uuid of ebook to zip

    Returns:
        Path: path to zipped .epub file to download
    """
    path_name = f"test-books/{ebook_uuid}/"
    zipfile_name = shutil.make_archive(ebook_uuid, 'zip', path_name)
    path = Path(zipfile_name)
    path = path.rename(path.with_suffix('.epub'))
    return path


def extract_title(epub_path):
    """ Looks for the container.xml file under the path send as parameter
        and extracts the path to the root file from which we can get the title.

    Args:
        epub_path (String): the path to the unzipped contents

    Returns:
        String: extracted title of ebook
    """
    filepath = epub_path + "/META-INF/container.xml"
    with open(filepath, 'r') as file:
        content = BeautifulSoup(file, 'xml')
        opf_path = epub_path + "/" + content.find('rootfile')["full-path"]
        with open(opf_path, 'r') as f:
            opf_content = BeautifulSoup(f, 'xml')
            title = opf_content.find('title').string
            return title


def unzip_ebook(epub_path, contents_dir):
    """ Unzips the epub file found at 'epub_path' under the 'contents_dir'.
    Calls helper to extract the epub title.

    Args:
        epub_path (String): the path to the .epub file
        contents_dir (String): the directory to which the contents should be extracted

    Returns:
        String: extracted title of ebook
    """
    # Turns epub file into zip archive
    with ZipFile(epub_path, 'r') as zipped_epub:
        zipped_epub.extractall(contents_dir)
        # Remove the original .epub file
        os.remove(epub_path)
    return extract_title(contents_dir)


def push_epub_folder_to_github(folder, message):
    """ Push the folder of the contents of the book to
    the GitHub repository from server/wsgi.py

    Args:
        folder (String): the folder with the book contents
        message (String): the commit message
    """
    subprocess.run(["git", "add", folder])
    subprocess.run(["git", "commit", "--quiet", "-m", message])
    subprocess.run(["git", "pull", "--allow-unrelated-histories"])
    subprocess.run(["git", "push", "--quiet"])


def check_ebook(ebook_filepath):
    """ Runs EpubCheck on the book corresponding to the path.

    Args:
        ebook_filepath (String): the local filepath where the book can be found

    Returns:
        boolean, list: returns the messages received from the EpubCheck
        and true if the book is valid or false otherwise
    """
    epub_path = f"/app/{ebook_filepath}"
    if not os.path.isfile(epub_path):
        return False, ["Original .epub file not found!"]
    result = EpubCheck(epub_path)
    valid = result.valid
    messages = result.messages
    if valid:
        return valid, messages
    valid = True
    for message in messages:
        if message.level == 'ERROR':
            valid = False
            break
    return valid, messages


def process_ebook(ebook):
    """ The main method that is invoked in the upload view and runs
    all tasks of the data processing pipeline.
    Checks whether the uploaded book is valid.
    Converts a valid ePub2 into an ePub3.
    Makes the new ePub3 accessible.

    Args:
        ebook (Ebook): the ebook object to be processed
    """
    epub_path = f"test-books/{ebook.epub.name}"
    valid, messages = check_ebook(epub_path)
    ebook.checker_issues = str(list(map(lambda m: f"{m.level} - {m.id} "
                                                  f"- {m.location} - {m.message}",
                                        messages)))
    if not valid:
        ebook.state = 'INVALID'
        ebook.save(update_fields=["state", "checker_issues"])
        # Remove the original .epub file
        os.remove(epub_path)
        return
    ebook.state = 'UNZIPPING'
    ebook.save(update_fields=["state", "checker_issues"])

    ebook_dir = f"test-books/{ebook.uuid}"
    mode = os.environ.get('GITHUB_MODE', 'production')
    try:
        ebook_title = unzip_ebook(epub_path, ebook_dir)
        # Push unzipped contents to GitHub
        if mode == "development":
            message = f"Upload {ebook.uuid}"
            push_epub_folder_to_github(ebook_dir, message)
    except FileNotFoundError:
        ebook.state = 'UNZIPPING_FAILED'
        ebook.save(update_fields=["state"])
        return

    ebook.title = ebook_title
    ebook.state = 'CONVERTING'
    ebook.save(update_fields=["title", "state"])

    # TODO: CONVERT TO EPUB3
    # TODO: MAKE ACCESSIBLE

    ebook.state = 'PROCESSED'
    ebook.save(update_fields=["state"])
