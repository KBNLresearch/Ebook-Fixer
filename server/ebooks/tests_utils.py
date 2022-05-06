from django.test import TestCase
from uuid import uuid4
import os
import shutil

from .utils import inject_image_annotations
from .models import Ebook
from images.models import Image
from annotations.models import Annotation


class UtilsTest(TestCase):
    def test_inject_image_annotations(self):
        uuid = uuid4()
        test_html_content = '<html><body><img src="test.jpg"/></body></html>'
        html_path = os.path.abspath("./") + f"/test-books/{uuid}"
        html_filename = "test.html"
        os.mkdir(html_path)
        html_content_path = html_path + "/OEBPS/"
        os.mkdir(html_content_path)
        with open(html_content_path + html_filename, "w") as file:
            file.write(test_html_content)

        ebook = Ebook.objects.create(uuid=uuid, epub3_path="TEST_PATH", title="TEST_TITLE")
        image = Image.objects.create(ebook=ebook, filename="test.jpg", location=html_filename,
                                     classification="INFO", raw_context=" ")
        annotation = Annotation.objects.create(image=image, type="HUM",
                                               text="TEST ANNOTATION", confidence=1.0)

        inject_image_annotations(uuid, ["test.html"], [image], [annotation])

        with open(html_content_path + html_filename, "r") as file:
            self.assertEqual(file.readline(),
                             '<html><body><img alt="TEST ANNOTATION" '
                             'src="test.jpg"/></body></html>')

        shutil.rmtree(html_path)
