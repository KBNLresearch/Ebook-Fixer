from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from uuid import uuid4

from .views import ebook_detail_view, ebook_download_view
from .models import Ebook
from .serializers import EbookSerializer
import os
import shutil


class ViewsTest(TestCase):
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
        ebook = Ebook.objects.create(uuid=self.uuid, epub3_path="TEST_PATH", title="TEST_TITLE")

        response, data = self.response_ebook_detail_view()
        data = data.decode('utf-8')

        self.assertEqual(response.status_code, 200)
        expected_data = str(EbookSerializer(ebook).data).replace("'", '"')
        self.assertEqual(data, expected_data)

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

    def test_ebook_download_view_404_file_not_found(self):
        Ebook.objects.create(uuid=self.uuid, epub3_path="TEST_PATH", title="TEST_TITLE")

        response, msg = self.response_ebook_download_view()

        self.assertEqual(response.status_code, 404)
        expected_msg = '{"msg": ' + f'"Files for ebook with uuid {self.uuid} not found!'\
            ' Zipping failed!"' + '}'
        self.assertEqual(msg, bytes(expected_msg, 'utf-8'))

    def test_ebook_download_view_200(self):
        Ebook.objects.create(uuid=self.uuid, epub3_path="TEST_PATH", title="TEST_TITLE")

        test_filename = "test_content.txt"
        test_txt_content = "Represents an unzipped ebook"

        folder_path = os.path.abspath("./") + f"/test-books/{self.uuid}/"
        os.mkdir(folder_path)
        file_path = f"{folder_path}{test_filename}"

        with open(file_path, "w") as file:
            file.write(test_txt_content)

        response, msg = self.response_ebook_download_view()

        epub_path = f"./{self.uuid}.epub"

        self.assertTrue(os.path.exists(f"{epub_path}"))
        self.assertEqual(response.status_code, 200)

        shutil.rmtree(folder_path)
