import os
import shutil

from .models import Ebook
from .utils import inject_image_annotations, reformat_html_files, unzip_ebook
from annotations.models import Annotation
from images.models import Image

from django.test import TestCase
from unittest.mock import patch
from uuid import uuid4


def mock_zip(filepath, rule):
    open(filepath, "x")
    return MockedZipFile()


def html_files_set_up(html_path, html_filename):
    test_html_content = '<html><body><img src="test.jpg"/><img src="moon.jpg"/></body></html>'
    os.mkdir(html_path)
    html_content_path = html_path + "/OEBPS/"
    os.mkdir(html_content_path)
    with open(html_content_path + html_filename, "w") as file:
        file.write(test_html_content)


class MockedZipFile:
    def __init__(self):
        self.test_file_1 = "container.xml"
        self.test_file_2 = "content.opf"

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def extractall(self, filepath):
        # Temporarily store test files for epub zipfile
        container_content = '<?xml version="1.0" encoding="UTF-8"?>' \
                            '<container version="1.0" ' \
                            'xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' \
                            '<rootfiles>' \
                            '<rootfile full-path="content.opf" ' \
                            'media-type="application/oebps-package+xml"/>' \
                            '</rootfiles>' \
                            '</container>'
        opf_file_content = '<metadata><dc:title>Hamlet</dc:title></metadata>'
        with open(filepath + "/META-INF/" + self.test_file_1, "w") as file1:
            file1.write(container_content)
        with open(filepath + "/" + self.test_file_2, "w") as file2:
            file2.write(opf_file_content)


class UtilsTest(TestCase):
    def setUp(self):
        self.uuid = uuid4()

    def test_inject_image_annotations(self):
        html_path = os.path.abspath("./") + f"/test-books/{self.uuid}"
        html_filename = "test.html"
        html_files_set_up(html_path, html_filename)
        ebook = Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE")
        image = Image.objects.create(ebook=ebook,
                                     filename="test.jpg",
                                     location="/OEBPS/" + html_filename,
                                     classification="INFO",
                                     raw_context=" ")
        annotation = Annotation.objects.create(image=image, type="HUM",
                                               text="TEST ANNOTATION")

        inject_image_annotations(html_path, [image], [annotation])

        with open(html_path + "/OEBPS/" + html_filename, "r") as file:
            self.assertEqual(file.readlines(),
                             ['<html>\n',
                              '    <body>\n',
                              '        <img alt="TEST ANNOTATION" src="test.jpg"/>\n',
                              '        <img src="moon.jpg"/>\n',
                              '    </body>\n',
                              '</html>'])
        shutil.rmtree(html_path)

    def test_missing_annotations_injection(self):
        html_path = os.path.abspath("./") + f"/test-books/{self.uuid}"
        html_filename = "test.html"
        html_files_set_up(html_path, html_filename)
        uuid_test = uuid4()
        ebook_test1 = Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE")
        Ebook.objects.create(uuid=uuid_test, title="DUMMY BOOK")
        image = Image.objects.create(ebook=ebook_test1,
                                     filename="test.jpg",
                                     location="random.html",
                                     classification="INFO",
                                     raw_context=" ")
        annotation = Annotation.objects.create(image=image, type="HUM",
                                               text="TEST ANNOTATION")

        inject_image_annotations(f"test-books/{uuid_test}", [image], [annotation])

        with open(html_path + "/OEBPS/" + html_filename, "r") as file:
            self.assertEqual(file.readline(),
                             '<html><body><img src="test.jpg"/><img src="moon.jpg"/></body></html>')
        shutil.rmtree(html_path)

    def test_annotations_injection_html_file_missing(self):
        html_path = os.path.abspath("./") + f"/test-books/{self.uuid}"
        html_filename = "test.html"
        html_files_set_up(html_path, html_filename)
        ebook = Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE")
        image1 = Image.objects.create(ebook=ebook, filename="test.jpg", location="random.html")
        image2 = Image.objects.create(ebook=ebook, filename="random.jpg", location=html_filename)
        annotation1 = Annotation.objects.create(image=image1, type="HUM",
                                                text="DUMMY ANNOTATION")
        annotation2 = Annotation.objects.create(image=image2, type="HUM",
                                                text="TEST ANNOTATION")

        inject_image_annotations(html_path, [image1, image2], [annotation1, annotation2])

        with open(html_path + "/OEBPS/" + html_filename, "r") as file:
            self.assertEqual(file.readline(),
                             '<html><body><img src="test.jpg"/><img src="moon.jpg"/></body></html>')
        shutil.rmtree(html_path)

    @patch("ebooks.utils.ZipFile", mock_zip)
    def test_unzip_epub_file_and_extract_title(self):
        filepath = "test-books/test-uuid/"
        os.mkdir(filepath)
        os.mkdir(filepath + "META-INF/")

        test_file_1 = "container.xml"
        test_file_2 = "content.opf"
        container_content = '<?xml version="1.0" encoding="UTF-8"?>' \
                            '<container version="1.0" ' \
                            'xmlns="urn:oasis:names:tc:opendocument:xmlns:container">' \
                            '<rootfiles>' \
                            '<rootfile full-path="content.opf" ' \
                            'media-type="application/oebps-package+xml"/>' \
                            '</rootfiles>' \
                            '</container>'
        opf_file_content = '<metadata><dc:title>Hamlet</dc:title></metadata>'

        # Unzip the test.epub file, now containing 2 files
        title = unzip_ebook(f"{filepath}/test.zip", f"{filepath}")

        # Check the title
        self.assertEqual(title, 'Hamlet')
        # Check that the zip contents indeed exist
        self.assertTrue(os.path.isfile("test-books/test-uuid/META-INF/" + test_file_1))
        self.assertTrue(os.path.isfile("test-books/test-uuid/" + test_file_2))
        # Check that the contents remained the same
        with open(filepath + "META-INF/" + test_file_1, "r") as file1:
            self.assertEqual(file1.readline(), container_content)
        with open(filepath + test_file_2, "r") as file2:
            self.assertEqual(file2.readline(), opf_file_content)

        shutil.rmtree(filepath)

    def test_reformat_html_file_no_language_tag(self):
        html_content = '<html><body></body></html>'
        html_file = 'test.html'
        with open(html_file, 'w') as file:
            file.write(html_content)

        reformat_html_files([html_file])

        with open(html_file, 'r') as file:
            self.assertEqual(file.readlines(), ['<html>\n',
                                                '    <body>\n',
                                                '    </body>\n',
                                                '</html>'])
