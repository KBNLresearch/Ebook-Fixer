# TODO Fix this file
# from django.test import TestCase
# from uuid import uuid4
# from unittest.mock import patch
# from .utils import google_vision_labels


# def mock_label_detection():
#     return MockedImageAnnotatorClient()


# class MockedImageAnnotatorClient:
#     def __enter__(self):
#         return self

#     def __exit__(self, exc_type, exc_val, exc_tb):
#         pass

#     def label_detection(image):
#         return


# class UtilsTest(TestCase):
#     def setUp(self):
#         self.uuid = uuid4()

#     @patch("annotations.utils.vision.ImageAnnotatorClient", mock_label_detection)
#     def test_google_vision_labels(self):

#         generated_labels = google_vision_labels()
#         expected = {'House': 0.9422, 'Sky': 0.8424, 'Tile': 0.8421}
#         self.assertEquals(expected, generated_labels)
