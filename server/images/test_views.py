import json

from .models import Image
from .serializers import ImageSerializer
from .views import image_classification_view, image_details_view, image_get_all_view
from annotations.models import Annotation
from ebooks.models import Ebook

from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from django.test import RequestFactory, TestCase
from uuid import uuid4


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

    def response_image_details_view(self, filename=None, uuid=None):
        path = "get/"
        if uuid is not None:
            if filename is not None:
                request = self.factory.get(path, {"image": filename}, **{"HTTP_ebook": uuid})
            else:
                request = self.factory.get(path, **{"HTTP_ebook": uuid})
        else:
            request = self.factory.get(path)
        request.user = self.user

        response = image_details_view(request)
        msg = response.content

        return response, msg

    def response_image_get_all_view(self, uuid=None):
        path = "getAll/"
        if uuid is not None:
            request = self.factory.get(path, **{"HTTP_ebook": uuid})
        else:
            request = self.factory.get(path)
        request.user = self.user

        response = image_get_all_view(request)
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

    def test_image_classification_view_200_including_decorative_classification(self):
        uuid = uuid4()
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="TEST_EPUB.epub")
        image = Image.objects.create(ebook=ebook, filename="image.jpg", location="file.html")
        content = "{\n" f'"ebook": "{str(uuid)}",\n' '"filename": "image.jpg",\n' \
                  '"location": "file.html",\n' '"classification": "Decoration",\n' \
                  '"raw_context": "NEW CONTEXT"\n' "}"

        response, msg = self.response_image_classification_view(content)

        image.classification = "Decoration"
        image.raw_context = "NEW CONTEXT"
        serializer = ImageSerializer(image)
        js = JsonResponse(serializer.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(msg, js.content)
        self.assertEqual(Annotation.objects.filter(image=image, type="HUM").count(), 1)

    def test_image_classification_view_200_update_existing_annotation(self):
        uuid = uuid4()
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="TEST_EPUB.epub")
        image = Image.objects.create(ebook=ebook, filename="image.jpg", location="file.html")
        Annotation.objects.create(image=image, type="HUM", text="OLD TEXT")
        content = "{\n" f'"ebook": "{str(uuid)}",\n' '"filename": "image.jpg",\n' \
                  '"location": "file.html",\n' '"classification": "Decoration",\n' \
                  '"raw_context": "NEW CONTEXT"\n' "}"

        response, msg = self.response_image_classification_view(content)

        image.classification = "Decoration"
        image.raw_context = "NEW CONTEXT"
        serializer = ImageSerializer(image)
        js = JsonResponse(serializer.data)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(msg, js.content)
        annotation = Annotation.objects.filter(image=image, type="HUM").get()
        self.assertEqual(annotation.text, "")

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
        filename = "test.jpg"
        request = self.factory.post(f"get/{filename}/")
        request.user = self.user

        response = image_details_view(request)

        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_image_details_view_400_missing_header(self):
        filename = "test.jpg"

        response, msg = self.response_image_details_view(filename)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(msg), "{'msg': 'Ebook header not found in the request!'}")

    def test_image_details_view_400_missing_parameter(self):
        uuid = uuid4()
        response, msg = self.response_image_details_view(uuid=uuid)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(msg),
                         "{'msg': 'Image parameter not found in the request!'}")

    def test_image_details_view_404_missing_ebook(self):
        filename = "test.jpg"
        uuid = uuid4()

        response, msg = self.response_image_details_view(filename, uuid)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(msg),
                         "{'msg': " f"'Ebook with uuid {uuid} not found!'" "}")

    def test_image_details_view_404_missing_image(self):
        uuid = uuid4()
        filename = "test.jpg"
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="test.epub")
        Image.objects.create(ebook=ebook, filename=filename, location="test.html")

        response, msg = self.response_image_details_view("random.jpg", uuid)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(msg),
                         "{'msg': " f"'Image random.jpg not found in ebook {uuid}!'" "}")

    def test_image_details_view_200(self):
        uuid = uuid4()
        test_filename = "test.jpg"
        test_location = "test.html"
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="test.epub")
        Image.objects.create(ebook=ebook, filename=test_filename, location=test_location)

        response, msg = self.response_image_details_view(test_filename, uuid)

        self.assertEqual(response.status_code, 200)
        expected_response = json.loads(msg)
        self.assertEqual(expected_response["image"]["ebook"], str(uuid))
        self.assertEqual(expected_response["image"]["filename"], test_filename)
        self.assertEqual(expected_response["image"]["location"], test_location)
        self.assertEqual(expected_response["image"]["classification"], "INFO")  # default value
        self.assertEqual(expected_response["image"]["raw_context"], "")  # default value
        self.assertEqual(expected_response["annotations"], [])

    def test_image_get_all_view_405(self):
        request = self.factory.post("getAll/")
        request.user = self.user

        response = image_get_all_view(request)
        self.assertEqual(response.status_code, 405)
        self.assertEqual(decode_message(response.content), "{'msg': 'Method Not Allowed!'}")

    def test_image_get_all_view_400_missing_header(self):

        response, msg = self.response_image_get_all_view()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(decode_message(msg), "{'msg': 'Ebook header not found in the request!'}")

    def test_image_get_all_view_404_missing_ebook(self):
        uuid = uuid4()

        response, msg = self.response_image_get_all_view(uuid)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(decode_message(msg),
                         "{'msg': " f"'Ebook with uuid {uuid} not found!'" "}")

    def test_image_get_all_view_200(self):
        uuid = uuid4()
        test_filename = "test.jpg"
        test_location = "test.html"
        test_classification = "Art"
        test_raw_context = "RAW CONTEXT"
        ebook = Ebook.objects.create(uuid=uuid, title="TEST TITLE", epub="test.epub")
        Image.objects.create(ebook=ebook, filename=test_filename, location=test_location,
                             classification=test_classification, raw_context=test_raw_context)

        response, msg = self.response_image_get_all_view(uuid)

        self.assertEqual(response.status_code, 200)
        expected_response = json.loads(msg)
        self.assertEqual(len(expected_response["images"]), 1)
        self.assertEqual(expected_response["images"][0]['image']["ebook"], str(uuid))
        self.assertEqual(expected_response["images"][0]['image']["filename"], test_filename)
        self.assertEqual(expected_response["images"][0]['image']["location"], test_location)
        self.assertEqual(expected_response["images"][0]['image']["classification"],
                         test_classification)
        self.assertEqual(expected_response["images"][0]['image']["raw_context"], test_raw_context)
        self.assertEqual(expected_response["images"][0]['annotated'], False)
