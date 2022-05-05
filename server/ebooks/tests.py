from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from uuid import uuid4

from .views import ebook_detail_view
from .models import Ebook
from .serializers import EbookSerializer


class DownloadTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = AnonymousUser()

    def response_ebook_detail_view(self, uuid):
        request = self.factory.get(f'{uuid}/')
        request.user = self.user

        response = ebook_detail_view(request, uuid)
        msg = response.content

        return response, msg

    def test_ebook_details_view_404(self):
        uuid = uuid4()
        response, msg = self.response_ebook_detail_view(uuid)

        self.assertEqual(response.status_code, 404)
        expected_msg = '{"msg": ' + f'"Ebook with uuid {uuid} not found!"' + '}'
        self.assertEqual(msg, bytes(expected_msg, 'utf-8'))

    def test_ebook_details_view_405(self):
        uuid = uuid4()

        request = self.factory.post(f'{uuid}/')
        request.user = self.user

        response = ebook_detail_view(request, uuid)
        msg = response.content

        self.assertEqual(response.status_code, 405)
        self.assertEqual(msg, b'{"msg": "Method Not Allowed!"}')

    def test_ebook_details_view_200(self):
        uuid = uuid4()
        ebook = Ebook.objects.create(uuid=uuid, epub3_path="TEST_PATH", title="TEST_TITLE")

        response, data = self.response_ebook_detail_view(uuid)
        data = data.decode('utf-8')

        self.assertEqual(response.status_code, 200)
        expected_data = str(EbookSerializer(ebook).data).replace("'", '"')
        self.assertEqual(data, expected_data)
