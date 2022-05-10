from django.test import TestCase
from uuid import uuid4
from unittest.mock import patch
import os
import shutil
from .utils import inject_image_annotations, unzip_ebook
from .models import Ebook
from images.models import Image
from annotations.models import Annotation


def mock_zip(filepath, rule):
    open(filepath, "x")
    return MockedZipFile()


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
        test_html_content = '<html><body><img src="test.jpg"/></body></html>'
        html_path = os.path.abspath("./") + f"/test-books/{self.uuid}"
        html_filename = "test.html"
        os.mkdir(html_path)
        html_content_path = html_path + "/OEBPS/"
        os.mkdir(html_content_path)
        with open(html_content_path + html_filename, "w") as file:
            file.write(test_html_content)

        ebook = Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE")
        image = Image.objects.create(ebook=ebook, filename="test.jpg", location=html_filename,
                                     classification="INFO", raw_context=" ")
        annotation = Annotation.objects.create(image=image, type="HUM",
                                               text="TEST ANNOTATION", confidence=1.0)

        inject_image_annotations(self.uuid, ["test.html"], [image], [annotation])

        with open(html_content_path + html_filename, "r") as file:
            self.assertEqual(file.readline(),
                             '<html><body><img alt="TEST ANNOTATION" '
                             'src="test.jpg"/></body></html>')

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
        title = unzip_ebook("test-uuid", "test.zip")

        # Check the title
        self.assertEqual(title, 'Hamlet')
        # Check that the zip contents indeed exist
        self.assertTrue(os.path.isfile("test-books/test-uuid/META-INF/" + test_file_1))
        self.assertTrue(os.path.isfile("test-books/test-uuid/" + test_file_2))
        # Check that the original zip file is removed
        self.assertFalse(os.path.exists("test-books/test-uuid/" + "test.zip"))
        # Check that the contents remained the same
        with open(filepath + "META-INF/" + test_file_1, "r") as file1:
            self.assertEqual(file1.readline(), container_content)
        with open(filepath + test_file_2, "r") as file2:
            self.assertEqual(file2.readline(), opf_file_content)

        shutil.rmtree(filepath)
