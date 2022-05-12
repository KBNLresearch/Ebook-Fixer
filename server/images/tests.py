import json
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from django.http import JsonResponse
from ebooks.models import Ebook
from uuid import uuid4
from .views import image_details_view, image_classification_view
from .models import Image
from.serializers import ImageSerializer


def decode_message(msg):
    return msg.decode('utf-8').replace('"', "'")


class ImageViewsTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = AnonymousUser()

    def response_image_classification_view(self, content):
        request = self.factory.put("classify/",
                                   data=content,
                                   content_type="application/json")
        request.user = self.user

        response = image_classification_view(request)
        msg = response.content

        return response, msg

    def response_image_details_view(self, image_id, uuid=None):
        path = f"get/{image_id}/"
        if uuid is not None:
            request = self.factory.get(path, **{"HTTP_ebook": uuid})
        else:
            request = self.factory.get(path)
        request.user = self.user

        response = image_details_view(request, image_id)
        msg = response.content

        return response, msg

    def test_image_classification_view_405(self):
        request = self.factory.get("classify/")
        request.user = self.user

        response = image_classification_view(request)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_image_classification_view_400_empty_body(self):
        request = self.factory.put("classify/")
        request.user = self.user

        response = image_classification_view(request)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(response.content),
                         "{'msg': 'No data found in the request!'}")

    def test_image_classification_view_400_extra_fields(self):
        content = """{
                        "ebook": "5a94ef04-a660-4b64-99f1-7b91813d0ffe",
                        "random_field": "random_value"
                      }"""
        response, msg = self.response_image_classification_view(content)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(msg),
                         "{'msg': 'The body of the request has fields that are not supported!'}")

    def test_image_classification_view_404(self):
        uuid = uuid4()
        Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="TEST_EPUB.epub")
        content = """{
                        "ebook": "random_not_uuid_value"
                      }"""

        response, msg = self.response_image_classification_view(content)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(msg),
                         "{'msg': 'Ebook with uuid random_not_uuid_value not found!'}")

    def test_image_classification_view_400_missing_fields(self):
        uuid = uuid4()
        Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="TEST_EPUB.epub")
        content = "{\n" f'"ebook": "{str(uuid)}",\n' '"filename": "image.jpg"\n' "}"

        response, msg = self.response_image_classification_view(content)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(msg),
                         "{'msg': 'The body of the request is not in the correct format!'}")

    def test_image_classification_view_400_invalid_image_type(self):
        uuid = uuid4()
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="TEST_EPUB.epub")
        Image.objects.create(ebook=ebook, filename="image.jpg", location="file.html")
        content = "{\n" f'"ebook": "{str(uuid)}",\n' '"filename": "image.jpg",\n' \
                  '"location": "file.html",\n' '"classification": "invalid_classification"\n' "}"

        response, msg = self.response_image_classification_view(content)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(msg), "{'msg': 'This type of image is not in supported!'}")

    def test_image_classification_view_200_including_optional_fields(self):
        uuid = uuid4()
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="TEST_EPUB.epub")
        image = Image.objects.create(ebook=ebook, filename="image.jpg", location="file.html")
        content = "{\n" f'"ebook": "{str(uuid)}",\n' '"filename": "image.jpg",\n' \
                  '"location": "file.html",\n' '"classification": "Map",\n' \
                  '"raw_context": "NEW CONTEXT"\n' "}"

        response, msg = self.response_image_classification_view(content)

        image.classification = "Map"
        image.raw_context = "NEW CONTEXT"
        serializer = ImageSerializer(image)
        js = JsonResponse(serializer.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(msg, js.content)

    def test_image_classification_view_200_excluding_optional_fields(self):
        uuid = uuid4()
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="TEST_EPUB.epub")
        image = Image.objects.create(ebook=ebook, filename="image.jpg", location="file.html")
        content = "{\n" f'"ebook": "{str(uuid)}",\n' '"filename": "image.jpg",\n' \
                  '"location": "file.html"' "}"

        response, msg = self.response_image_classification_view(content)

        serializer = ImageSerializer(image)
        js = JsonResponse(serializer.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(msg, js.content)

    def test_image_details_view_405(self):
        image_id = 1
        request = self.factory.post(f"get/{image_id}/")
        request.user = self.user

        response = image_details_view(request, image_id)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_image_details_view_missing_header(self):
        image_id = 1

        response, msg = self.response_image_details_view(image_id)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(msg), "{'msg': 'Ebook header not found in the request!'}")

    def test_image_details_view_missing_ebook(self):
        image_id = 1
        uuid = uuid4()

        response, msg = self.response_image_details_view(image_id, uuid)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(msg),
                         "{'msg': " f"'Ebook with uuid {uuid} not found!'" "}")

    def test_image_details_view_missing_image(self):
        uuid = uuid4()
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="test.epub")
        image = Image.objects.create(ebook=ebook, filename="test.jpg", location="test.html")
        image_id = image.id + 1

        response, msg = self.response_image_details_view(image_id, uuid)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(msg),
                         "{'msg': " f"'Image with id {image_id} and ebook {uuid} not found!'" "}")

    def test_image_details_view_200(self):
        uuid = uuid4()
        test_filename = "test.jpg"
        test_location = "test.html"
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="test.epub")
        image = Image.objects.create(ebook=ebook, filename=test_filename, location=test_location)
        image_id = image.id

        response, msg = self.response_image_details_view(image_id, uuid)

        self.assertEqual(response.status_code, 200)
        expected_response = json.dumps({"image": {"id": image_id,
                                                  "ebook": str(uuid),
                                                  "filename": test_filename,
                                                  "location": test_location,
                                                  "classification": "INFO",  # default value
                                                  "raw_context": ""  # default value
                                                  },
                                        "annotations": []
                                        }).replace('"', "'")
        self.assertEqual(decode_message(msg), expected_response)
