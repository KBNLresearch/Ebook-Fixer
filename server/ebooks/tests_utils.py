from django.test import TestCase
from uuid import uuid4
import os
import shutil
from zipfile import ZipFile

from .utils import extract_title, inject_image_annotations, unzip_ebook
from .models import Ebook
from images.models import Image
from annotations.models import Annotation


class UtilsTest(TestCase):
    def setUp(self):
        self.uuid = uuid4()
        print(f"\n\n RANDOM UUID FOR TEST: {self.uuid}\n\n")

    # def test_inject_image_annotations(self):
    #     test_html_content = '<html><body><img src="test.jpg"/></body></html>'
    #     html_path = os.path.abspath("./") + f"/test-books/{self.uuid}"
    #     html_filename = "test.html"
    #     os.mkdir(html_path)
    #     html_content_path = html_path + "/OEBPS/"
    #     os.mkdir(html_content_path)
    #     with open(html_content_path + html_filename, "w") as file:
    #         file.write(test_html_content)

    #     ebook = Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE")
    #     image = Image.objects.create(ebook=ebook, filename="test.jpg", location=html_filename,
    #                                  classification="INFO", raw_context=" ")
    #     annotation = Annotation.objects.create(image=image, type="HUM",
    #                                            text="TEST ANNOTATION", confidence=1.0)

    #     inject_image_annotations(self.uuid, ["test.html"], [image], [annotation])

    #     with open(html_content_path + html_filename, "r") as file:
    #         self.assertEqual(file.readline(),
    #                          '<html><body><img alt="TEST ANNOTATION" '
    #                          'src="test.jpg"/></body></html>')

    #     shutil.rmtree(html_path)

    # def test_extract_title(self):
    #     opf_file_content = '<metadata><dc:title>Hamlet</dc:title></metadata>'
    #     file_path = os.path.abspath("./") + f"/test-books/{self.uuid}"
    #     xml_filename = "content.opf"
    #     os.mkdir(file_path)
    #     # content.opf is found under ./test-books/{uuid}/OEBPS/
    #     content_path = file_path + "/OEBPS/"
    #     os.mkdir(content_path)
    #     with open(content_path + xml_filename, "w") as file:
    #         file.write(opf_file_content)
    #     expected_title = 'Hamlet'
    #     result_title = extract_title(self.uuid)
    #     self.assertEqual(result_title, expected_title)

    def test_unzip_epub_file(self):
        # Create zip archive test.zip
        zip_file_path = f"test-books/{self.uuid}/"
        os.mkdir(zip_file_path)
        shutil.make_archive("test", 'zip', zip_file_path)

        # Temporarily store test files for epub zipfile
        test_file_1 = "hello-test.css"
        test_file_2 = "content.opf"
        contents_1 = 'text-align: left'
        contents_2 = '<metadata><dc:title>Hamlet</dc:title></metadata>'
        with open(test_file_1, "w") as file1:
            file1.write(contents_1)
        with open(test_file_2, "w") as file2:
            file2.write(contents_2)

        # Add test files to zip archive
        with ZipFile(zip_file_path + "test.zip", 'w') as myzip:
            myzip.write(test_file_1)
            myzip.write(test_file_2)
        # Remove temporary zip content files
        os.remove(test_file_1)
        os.remove(test_file_2)

        # Unzip the test.epub file, now containing 2 files
        unzip_ebook(self.uuid, "test.zip")

        # Check that the zip contents indeed exist
        self.assertTrue(os.path.isfile(zip_file_path + test_file_1))
        self.assertTrue(os.path.isfile(zip_file_path + test_file_2))
        # Check that the original zip file is removed
        self.assertFalse(os.path.exists(zip_file_path + "test.zip"))
        # Check that the contents remained the same
        with open(zip_file_path + test_file_1, "r") as file1:
            self.assertEqual(file1.readline(), contents_1)
        with open(zip_file_path + test_file_2, "r") as file2:
            self.assertEqual(file2.readline(), contents_2)
