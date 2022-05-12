from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from .views import annotation_save_view, annotation_generation_view
from .models import Annotation
from ebooks.models import Ebook
from images.models import Image
from uuid import uuid4
import json


def decode_message(msg):
    return msg.decode('utf-8').replace('"', "'")


class AnnotationViewsTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = AnonymousUser()

    def response_annotation_generation_view(self, content):
        request = self.factory.put("generate/",
                                   data=content,
                                   content_type="application/json")
        request.user = self.user

        response = annotation_generation_view(request)
        msg = response.content

        return response, msg

    def test_annotation_generation_view_405(self):
        request = self.factory.get("generate/")
        request.user = self.user

        response = annotation_generation_view(request)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_annotation_generation_view_400_missing_body(self):
        request = self.factory.put("generate/")
        request.user = self.user

        response = annotation_generation_view(request)

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

    def test_annotation_generation_view_200(self):
        uuid = uuid4()
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        Image.objects.create(id=image_id, ebook=ebook,
                             filename="test.jpg", location="test.html")

        content = {"ebook": str(uuid), "id": image_id, "filename": "test.jpg"}
        response, msg = self.response_annotation_generation_view(content)

        self.assertEqual(response.status_code, 200)
        response_content = json.loads(msg)
        self.assertEqual(response_content["image"], image_id)
        self.assertEqual(response_content["type"], "BB")
        # TODO: Should be removed/replaced once AI is added
        # the response of the AI could be mocked and used here
        self.assertEqual(response_content["text"], "REPLACE WITH AI ANNOTATION")

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

    def test_annotation_save_view_200_update_existing_annotation(self):
        uuid = uuid4()
        image_id = 1
        ebook = Ebook.objects.create(uuid=uuid, title="Test title", epub="test.epub")
        image = Image.objects.create(id=image_id, ebook=ebook,
                                     filename="test.jpg", location="test.html")
        Annotation.objects.create(image=image, type="HUM", text="old annotation")
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

    def test_annotation_save_view_error(self):
        request = self.factory.post("save/")
        request.user = self.user

        response = annotation_save_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'No data found in the request!'}")
