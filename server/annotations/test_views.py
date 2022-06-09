import json

from .views import (
    annotation_save_view,
    azure_annotation_generation_view,
    google_annotation_generation_view,
    yake_annotation_generation_view
)
from ebooks.models import Ebook
from images.models import Image

from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from unittest.mock import patch
from uuid import uuid4


def decode_message(msg):
    return msg.decode('utf-8').replace('"', "'")


def mock_google_vision_labels(image_path):
    return {'House': 0.9422, 'Sky': 0.8424, 'Tile': 0.8421}


def mock_image_not_found(image_path):
    raise FileNotFoundError


def mock_azure_utils(image_path):
    return "Mocked Sentence.", {'House': 0.9422, 'Sky': 0.8424, 'Tile': 0.8421}


def mock_yake_utils(image_path):
    return {'House': 0.9422, 'Sky': 0.8424, 'Tile': 0.8421}


class AnnotationViewsTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = AnonymousUser()

    def response_annotation_generation_view(self, content):
        request = self.factory.put("generate/",
                                   data=content,
                                   content_type="application/json")
        request.user = self.user

        response = google_annotation_generation_view(request)
        msg = response.content

        return response, msg

    def test_annotation_generation_view_405(self):
        request = self.factory.get("generate/")
        request.user = self.user

        response = google_annotation_generation_view(request)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_annotation_generation_view_400_missing_body(self):
        request = self.factory.put("generate/")
        request.user = self.user

        response = google_annotation_generation_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'No data found in the request!'}")

    def test_annotation_generation_view_400_missing_entries_body(self):
        content = {"id": 1, "filename": "test.jpg"}

        response, msg = self.response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'The body of the request is not in the correct format!'}")

    def test_annotation_generation_view_405_missing_ebook(self):
        uuid = uuid4()
        content = {"ebook": str(uuid), "id": 1, "filename": "test.jpg"}

        response, msg = self.response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Ebook with uuid " f"{uuid} not found!'" "}")

    def test_annotation_generation_view_405_missing_image(self):
        uuid = uuid4()
        image_id = 1
        Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}

        response, msg = self.response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Image with id "
                         f"{image_id} and ebook with uuid {uuid} not found!'" "}")

    @patch("annotations.views.google_vision_labels", mock_image_not_found)
    def test_annotation_generation_view_404_image_not_found(self):
        uuid = "TEST_UUID"
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook,
                             filename="test.jpg", location="test.html")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
        response, msg = self.response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Img test.jpg in ebook TEST_UUID not found'}")

    @patch("annotations.views.google_vision_labels", mock_google_vision_labels)
    def test_annotation_generation_view_200(self):
        uuid = uuid4()
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook,
                             filename="test.jpg", location="test.html")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
        response, msg = self.response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 200)

    # TODO Fix this test
    # @patch("annotations.views.google_vision_labels", mock_google_vision_labels)
    # def test_google_annotation_generation_view_200_annotations_already_exists(self):
    #     uuid = uuid4()
    #     image_id = 1
    #     ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
    #     image1 = Image.objects.create(id=image_id, ebook=ebook,
    #                                  filename="test.jpg", location="test.html")
    #     Annotation.objects.create(image=image1, type="BB_GOOGLE_LAB", text="Already existing")

    #     content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
    #     response, msg = self.response_annotation_generation_view(content)

    #     self.assertEqual(response.status_code, 200)

    def test_annotation_save_view_405(self):
        request = self.factory.get("save/")
        request.user = self.user

        response = annotation_save_view(request)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_annotation_save_view_200_new_annotation(self):
        uuid = uuid4()
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook, filename="test.jpg", location="test.html")
        content = {"ebook": str(uuid), "id": image_id,
                   "filename": "test.jpg", "text": "new annotation"}
        request = self.factory.post("save/",
                                    data=content,
                                    content_type="application/json")

        response = annotation_save_view(request)

        self.assertEqual(response.status_code, 200)
        response_content = json.loads(response.content)
        self.assertEqual(response_content["image"], image_id)
        self.assertEqual(response_content["type"], "HUM")
        self.assertEqual(response_content["text"], "new annotation")

    def test_annotation_save_view_400_missing_text_parameter(self):
        uuid = uuid4()
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook, filename="test.jpg", location="test.html")
        content = {"ebook": str(uuid), "id": image_id,
                   "filename": "test.jpg"}
        request = self.factory.post("save/",
                                    data=content,
                                    content_type="application/json")

        response = annotation_save_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Text parameter missing in the request body!'}")

    def test_annotation_save_view_error(self):
        request = self.factory.post("save/")
        request.user = self.user

        response = annotation_save_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'No data found in the request!'}")

    def azure_response_annotation_generation_view(self, content):
        request = self.factory.put("generate/",
                                   data=content,
                                   content_type="application/json")
        request.user = self.user

        response = azure_annotation_generation_view(request)
        msg = response.content

        return response, msg

    def test_azure_annotation_generation_view_405(self):
        request = self.factory.get("generate/")
        request.user = self.user

        response = azure_annotation_generation_view(request)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_azure_annotation_generation_view_400_missing_body(self):
        request = self.factory.put("generate/")
        request.user = self.user

        response = azure_annotation_generation_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'No data found in the request!'}")

    def test_azure_annotation_generation_view_400_missing_entries_body(self):
        content = {"id": 1, "filename": "test.jpg"}

        response, msg = self.azure_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'The body of the request is not in the correct format!'}")

    def test_azure_annotation_generation_view_405_missing_ebook(self):
        uuid = uuid4()
        content = {"ebook": str(uuid), "id": 1, "filename": "test.jpg"}

        response, msg = self.azure_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Ebook with uuid " f"{uuid} not found!'" "}")

    def test_azure_annotation_generation_view_405_missing_image(self):
        uuid = uuid4()
        image_id = 1
        Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}

        response, msg = self.azure_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Image with id "
                         f"{image_id} and ebook with uuid {uuid} not found!'" "}")

    @patch("annotations.views.azure_api_call", mock_image_not_found)
    def test_azure_annotation_generation_view_404_image_not_found(self):
        uuid = "TEST_UUID"
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook,
                             filename="test.jpg", location="test.html")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
        response, msg = self.azure_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Img test.jpg in ebook TEST_UUID not found'}")

    @patch("annotations.views.azure_api_call", mock_azure_utils)
    def test_azure_annotation_generation_view_200(self):
        uuid = uuid4()
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook,
                             filename="test.jpg", location="test.html")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
        response, msg = self.azure_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 200)

    def yake_response_annotation_generation_view(self, content):
        request = self.factory.put("generate/",
                                   data=content,
                                   content_type="application/json")
        request.user = self.user

        response = yake_annotation_generation_view(request)
        msg = response.content

        return response, msg

    def test_yake_annotation_generation_view_405(self):
        request = self.factory.get("generate/")
        request.user = self.user

        response = yake_annotation_generation_view(request)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_yake_annotation_generation_view_400_missing_body(self):
        request = self.factory.put("generate/")
        request.user = self.user

        response = yake_annotation_generation_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'No data found in the request!'}")

    def test_yake_annotation_generation_view_400_missing_entries_body(self):
        content = {"id": 1, "filename": "test.jpg"}

        response, msg = self.yake_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'The body of the request is not in the correct format!'}")

    def test_yake_annotation_generation_view_405_missing_ebook(self):
        uuid = uuid4()
        content = {"ebook": str(uuid), "id": 1, "filename": "test.jpg"}

        response, msg = self.yake_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Ebook with uuid " f"{uuid} not found!'" "}")

    def test_yake_annotation_generation_view_405_missing_image(self):
        uuid = uuid4()
        image_id = 1
        Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}

        response, msg = self.yake_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'Image with id "
                         f"{image_id} and ebook with uuid {uuid} not found!'" "}")

    @patch("annotations.views.yake_labels", mock_image_not_found)
    def test_yake_annotation_generation_view_404_image_not_found(self):
        uuid = "TEST_UUID"
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook,
                             filename="test.jpg", location="test.html")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
        response, msg = self.yake_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'The files for image test.jpg not found!'}")

    @patch("annotations.views.yake_labels", mock_yake_utils)
    def test_yake_annotation_generation_view_200(self):
        uuid = uuid4()
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook,
                             filename="test.jpg", location="test.html")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
        response, msg = self.yake_response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 200)
