from django.test import TestCase
from uuid import uuid4
from unittest.mock import patch
from .utils import google_vision_labels

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
        self.label_annotations = [MockGoogleLabel("House", 0.9422), MockGoogleLabel("Sky", 0.8424), MockGoogleLabel("Tile", 0.8421)]

    def label_detection(self, image):
        return self


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
