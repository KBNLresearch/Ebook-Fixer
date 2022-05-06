from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from uuid import uuid4

from .views import ebook_detail_view
from .views import ebook_upload_view
from .models import Ebook
from .serializers import EbookSerializer
from django.core.files.uploadedfile import SimpleUploadedFile


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

    def test_ebook_upload_view_405(self):
        request = self.factory.get('upload/')
        request.user = self.user

        response = ebook_upload_view(request)
        msg = response.content

        self.assertEqual(response.status_code, 405)
        self.assertEqual(msg, b'{"msg": "Method Not Allowed!"}')

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
