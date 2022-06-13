import glob
import os
import shutil
import subprocess

from bs4 import BeautifulSoup
from epubcheck import EpubCheck
from pathlib import Path
from zipfile import ZipFile


def inject_image_annotations(storage_path, images, annotations):
    """ Injects all human image annotations to their corresponding ALT-texts in the HTML files.

        Args:
            storage_path (String): the path to the contents of the ebook
            images (List[Image]): all images in that ebook
            annotations (List[Annotation]): all human annotations for the images
    """
    for image in images:
        try:
            # Inject the one with the largest id (the latest one)
            image_annotation = sorted([a for a in annotations if a.image == image],
                                      key=lambda a: a.id,
                                      reverse=True)[0]
        except IndexError:
            pass
        else:
            try:
                html_file = image.location
                html_content = open(storage_path + html_file)
                data = BeautifulSoup(html_content, 'html.parser')
                images_in_html = data.find_all('img', src=True)

                # Inject the image annotations
                for im in images_in_html:
                    basename = os.path.basename(image.filename)
                    if str(im['src']).endswith(basename):
                        im['alt'] = image_annotation.text

                # Update the html files
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
        ebook_uuid (String): the uuid of the ebook to zip

    Returns:
        Path: path to the zipped .epub file to download
    """
    path_name = f"test-books/{ebook_uuid}/"
    zipfile_name = shutil.make_archive(ebook_uuid, 'zip', path_name)
    path = Path(zipfile_name)
    return path


def extract_title(epub_path):
    """ Looks for the container.xml file under the path send as parameter and extracts the path to the root file from which we can get the title. # noqa: E501

    Args:
        epub_path (String): the path to the unzipped contents

    Returns:
        String: extracted title of the ebook
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
    Calls a helper method to extract the epub title.

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


def reformat_html_files(html_files, language_tag=None):
    """ Reformat the list of html files to follow this structure:
    <TAG_1>
        <TAG_2>
            ....
        </TAG_2>
    </TAG_1>

    Args:
        html_files (List): a list of the paths to the html files
        language_tag (String, optional): 2-character string that should be added to each html. Defaults to None. If None we only reformat the files but do not add the tag. # noqa: E501
    """
    for html_file in html_files:
        html_content = open(html_file)
        data = BeautifulSoup(html_content, 'html.parser')
        html = data.find('html')

        if language_tag is not None:
            html['xml:lang'] = language_tag
            html['lang'] = language_tag

        with open(html_file, "w") as file:
            text = data.prettify()
            text = add_indentation(text, 3)
            file.write(text)


def push_ebook_folder_to_github(folder, message):
    """ Push the folder of the contents of the book to the GitHub repository from server/wsgi.py.

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
        Boolean, List: returns the messages received from the EpubCheck and true if the book is valid or false otherwise # noqa: E501
    """
    epub_path = os.path.join(os.path.basename("."), ebook_filepath)
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
    """ The main method that is invoked in the upload view and runs all tasks of the data processing pipeline. # noqa: E501
    Checks whether the uploaded book is valid.
    Converts a valid ePub2 into an ePub3.
    Makes the new ePub3 accessible.
    Extracts the contents of the original .epub file and saves them in local storage.

    Args:
        ebook (Ebook): the ebook object to be processed
    """
    epub_path = f"test-books/{ebook.epub.name}"
    ebook_dir = f"test-books/{ebook.uuid}"
    valid, messages = check_ebook(epub_path)
    ebook.checker_issues = str(list(map(lambda m: f"{m.level} - {m.id} "
                                                  f"- {m.location} - {m.message}",
                                        messages)))
    ebook.save(update_fields=["checker_issues"])
    # Deprecated because EpubCheck is not as reliable as we thought
    # The errors/warnings will still be shown to the users, but they will be allowed to work on the EPUB # noqa: E501
    #############################
    # if not valid:
    #     ebook.state = 'INVALID'
    #     ebook.save(update_fields=["state"])
    #     # Remove the original .epub file
    #     shutil.rmtree(ebook_dir)
    #     return
    #############################
    ebook.state = 'UNZIPPING'
    ebook.save(update_fields=["state", "checker_issues"])

    try:
        ebook_title = unzip_ebook(epub_path, ebook_dir)
    except FileNotFoundError:
        ebook.state = 'UNZIPPING_FAILED'
        ebook.save(update_fields=["state"])
        return

    html_files = list(filter(lambda hf: os.path.isfile(hf),
                             glob.glob(f"{ebook_dir}/**/*html", recursive=True)))
    # Push unzipped contents to GitHub
    mode = os.environ.get('GITHUB_MODE', 'production')
    if mode == "development":
        message = f"{ebook.uuid}: upload"
        reformat_html_files(html_files)
        push_ebook_folder_to_github(ebook_dir, message)

    ebook.title = ebook_title
    ebook.state = 'CONVERTING'
    ebook.save(update_fields=["title", "state"])
    # TODO: CONVERT TO EPUB3

    ebook.state = 'MAKING_ACCESSIBLE'
    ebook.save(update_fields=["state"])
    # TODO: MAKE ACCESSIBLE

    try:
        # Retrieve the language tag from the root file and add it to all html files
        filepath = f"{ebook_dir}/META-INF/container.xml"
        with open(filepath, 'r') as file:
            content = BeautifulSoup(file, 'xml')
            opf_path = ebook_dir + "/" + content.find('rootfile')["full-path"]
            with open(opf_path, 'r') as f:
                opf_content = BeautifulSoup(f, 'xml')
                language = opf_content.find('language').string[:2]
        reformat_html_files(html_files, language)
        if mode == "development":
            message = f"{ebook.uuid}: add language tags"
            push_ebook_folder_to_github(ebook_dir, message)
    except FileNotFoundError:
        ebook.state = 'NOT_ACCESSIBLE'
        ebook.save(update_fields=["state"])
        return

    ebook.state = 'PROCESSED'
    ebook.save(update_fields=["state"])
