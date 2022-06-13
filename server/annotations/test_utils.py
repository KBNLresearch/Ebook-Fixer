import os
import shutil

from .utils import (
    azure_api_call,
    extract_context,
    google_vision_labels,
    yake_labels
)
from ebooks.models import Ebook
from images.models import Image

from django.test import TestCase
from uuid import uuid4
from unittest.mock import patch


def mock_post(analyze_url, headers, params, data):
    return MockResponse({'tags': 'test'})


def mock_extract_context(image):
    return "Mock context: House Sky Tile"


class MockResponse:
    def __init__(self, annotations):
        self.annotations = annotations

    def raise_for_status(self):
        pass

    def json(self):
        return {'tags': [{'name': 'House', 'confidence': 0.9422},
                         {'name': 'Sky', 'confidence': 0.8424},
                         {'name': 'Tile', 'confidence': 0.8421}],
                'description': {'tags': ['text', 'book'],
                                'captions': [{'text': 'Test MS sentence', 'confidence': 0.403}]}}


class MockIo:
    def __init__(self, path, mode):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def read(self):
        return None


class MockGoogleLabel:
    def __init__(self, description, score):
        self.description = description
        self.score = score


class MockedVisionImage:
    def __init__(self, content):
        pass


class MockedImageAnnotatorClient:
    def __init__(self):
        self.label_annotations = [MockGoogleLabel("House", 0.9422),
                                  MockGoogleLabel("Sky", 0.8424),
                                  MockGoogleLabel("Tile", 0.8421)]

    def label_detection(self, image):
        return self


class MockedKeywordExtractor:
    def __init__(self, top, stopwords):
        pass

    def extract_keywords(self, full_text):
        return [("House", 1 - 0.9422), ("Sky", 1 - 0.8424), ("Tile", 1 - 0.8421)]


class UtilsTest(TestCase):
    def setUp(self):
        self.uuid = uuid4()

    @patch("annotations.utils.vision.ImageAnnotatorClient", MockedImageAnnotatorClient)
    @patch("annotations.utils.vision.Image", MockedVisionImage)
    @patch("annotations.utils.io.open", MockIo)
    def test_google_vision_labels(self):
        test_image_path = "test.jpg"
        generated_labels = google_vision_labels(test_image_path)
        expected = {'House': 0.9422, 'Sky': 0.8424, 'Tile': 0.8421}
        self.assertEquals(expected, generated_labels)

    @patch("annotations.utils.io.open", MockIo)
    @patch("annotations.utils.requests.post", mock_post)
    @patch("annotations.utils.requests.Response", MockResponse)
    def test_azure_api_call(self):
        test_image_path = "test.jpg"
        generated_labels = azure_api_call(test_image_path)
        expected = "Test MS sentence", {'House': 0.9422, 'Sky': 0.8424, 'Tile': 0.8421}
        self.assertEquals(expected, generated_labels)

    @patch("annotations.utils.yake.KeywordExtractor", MockedKeywordExtractor)
    @patch("annotations.utils.extract_context", mock_extract_context)
    def test_yake_api_call(self):
        test_image_path = "test.jpg"
        generated_labels = yake_labels(test_image_path)
        expected = {'House': 0.9422, 'Sky': 0.8424, 'Tile': 0.8421}
        self.assertEquals(expected, generated_labels)

    def test_context_extraction(self):
        uuid = str(uuid4())
        ebook = Ebook.objects.create(uuid=uuid)
        html_file = "/test.html"
        ebook_dir = f"test-books/{uuid}"
        os.mkdir(ebook_dir)
        image = Image.objects.create(ebook=ebook, filename="/test.jpg", location=html_file)
        html_content = '<html>' \
                       '    <body>' \
                       '        <div>HEADING...' \
                       '        </div>' \
                       '        <p>TEXT BEFORE IMAGE!</p>' \
                       '        <img src="test.jpg"/>' \
                       '        <div>TEXT AFTER IMAGE.</div>' \
                       '        <div></div>' \
                       '        <div>TEXT THAT SHOULD NOT BE INCLUDED</div>' \
                       '    </body>' \
                       '</html>'
        with open(f"{ebook_dir}{html_file}", 'w') as file:
            file.write(html_content)

        context = extract_context(image)
        expected_context = 'TEXT BEFORE IMAGE!HEADING...        TEXT AFTER IMAGE.'

        self.assertEqual(context, expected_context)
        self.assertEqual(image.raw_context, expected_context)

        shutil.rmtree(ebook_dir)
