from unittest.mock import ANY
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from uuid import uuid4
from unittest.mock import patch

from .views import ebook_detail_view, ebook_download_view, ebook_upload_view
from .models import Ebook
from .serializers import EbookSerializer
import os
import shutil
from django.core.files.uploadedfile import SimpleUploadedFile


class EbookViewsTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = AnonymousUser()
        self.uuid = uuid4()

    def response_ebook_detail_view(self):
        request = self.factory.get(f'{self.uuid}/')
        request.user = self.user

        response = ebook_detail_view(request, self.uuid)
        msg = response.content

        return response, msg

    def test_ebook_details_view_404(self):
        response, msg = self.response_ebook_detail_view()

        self.assertEqual(response.status_code, 404)
        expected_msg = '{"msg": ' + f'"Ebook with uuid {self.uuid} not found!"' + '}'
        self.assertEqual(msg, bytes(expected_msg, 'utf-8'))

    def test_ebook_details_view_405(self):
        request = self.factory.post(f'{self.uuid}/')
        request.user = self.user

        response = ebook_detail_view(request, self.uuid)
        msg = response.content

        self.assertEqual(response.status_code, 405)
        self.assertEqual(msg, b'{"msg": "Method Not Allowed!"}')

    def test_ebook_details_view_200(self):

        test_file = SimpleUploadedFile(
            "test_epubfile.epub",
            b"These are the file contents!"   # note the b in front of the string [bytes]
        )
        ebook = Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE", epub=test_file)

        response, data = self.response_ebook_detail_view()
        data = data.decode('utf-8')

        self.assertEqual(response.status_code, 200)
        expected_data = str(EbookSerializer(ebook).data).replace("'", '"')
        self.assertEqual(data, expected_data)

        shutil.rmtree(os.path.abspath("./") + f"/test-books/{self.uuid}")

    def response_ebook_download_view(self):
        request = self.factory.get(f'/download/{self.uuid}/')
        request.user = self.user

        response = ebook_download_view(request, self.uuid)
        msg = response.content

        return response, msg

    def test_ebook_download_view_404_ebook_not_found(self):
        response, msg = self.response_ebook_download_view()

        self.assertEqual(response.status_code, 404)
        expected_msg = '{"msg": ' + f'"Ebook with uuid {self.uuid} not found!"' + '}'
        self.assertEqual(msg, bytes(expected_msg, 'utf-8'))

    def test_ebook_download_view_405(self):
        request = self.factory.post(f'/download/{self.uuid}/')
        request.user = self.user

        response = ebook_download_view(request, self.uuid)
        msg = response.content

        self.assertEqual(response.status_code, 405)
        self.assertEqual(msg, b'{"msg": "Method Not Allowed!"}')

    def test_ebook_upload_view_405(self):
        request = self.factory.get('upload/')
        request.user = self.user

        response = ebook_upload_view(request)
        msg = response.content

        self.assertEqual(response.status_code, 405)
        self.assertEqual(msg, b'{"msg": "Method Not Allowed!"}')

    def test_ebook_download_view_404_file_not_found(self):
        ebook = Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE", epub=None)

        response, msg = self.response_ebook_download_view()

        self.assertEqual(response.status_code, 404)
        expected_msg = '{"msg": ' + f'"Files for ebook with uuid {self.uuid} not found!'\
            ' Zipping failed!"' + '}'
        self.assertEqual(msg, bytes(expected_msg, 'utf-8'))
        self.assertEqual(ebook.__str__(), self.uuid)

    def test_ebook_download_view_200(self):
        test_filename = "test_content.txt"
        test_txt_content = b"Represents an unzipped ebook"

        test_file = SimpleUploadedFile(test_filename, test_txt_content)
        Ebook.objects.create(uuid=self.uuid, title="TEST_TITLE", epub=test_file)

        folder_path = os.path.abspath("./") + f"/test-books/{self.uuid}/"

        response, msg = self.response_ebook_download_view()

        epub_path = f"./{self.uuid}.epub"

        self.assertTrue(os.path.exists(f"{epub_path}"))
        self.assertEqual(response.status_code, 200)

        shutil.rmtree(folder_path)

    def test_ebook_upload_view_400(self):
        test_file = SimpleUploadedFile(
            "test_file.pdf",
            b"Only .epub files allowed!"
        )
        request = self.factory.post('upload/', {"epub": test_file})
        request.user = self.user

        response = ebook_upload_view(request)
        msg = response.content

        self.assertEqual(response.status_code, 400)
        self.assertEqual(msg, b'{"msg": "Make sure your uploaded file has extension .epub!"}')

    def test_upload_view_404(self):
        request = self.factory.post('upload/', {"msg": 'no epub file...'})
        request.user = self.user

        response = ebook_upload_view(request)
        msg = response.content

        self.assertEqual(response.status_code, 400)
        self.assertEqual(msg, b'{"msg": "No epub file found in request!"}')

    # @patch("ebooks.utils.unzip_ebook", unzip_ebook_mock)
    def test_upload_view_200(self):
        # Mock unzip_ebook() where it was called!
        # Note that logic is tested in tests_utils.py
        # This is about communication between client and server
        with patch("ebooks.views.unzip_ebook") as unzip_ebook_mock:
            # Stub mock to return extracted book title
            unzip_ebook_mock.return_value = "EXTRACTED TITLE"
            test_file = SimpleUploadedFile(
                "test_file.epub",
                b"Only .epub files allowed!"
            )
            request = self.factory.post('upload/', {"epub": test_file})
            response = ebook_upload_view(request)
            self.assertEqual(response.status_code, 200)
            # Verify if correct data passed to util function (UUID is random)
            unzip_ebook_mock.assert_called_once_with(ANY, "test_file.epub")
