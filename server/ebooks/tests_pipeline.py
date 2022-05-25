from django.test import TestCase
from unittest.mock import patch
from uuid import uuid4
from .models import Ebook
from .utils import check_ebook, process_ebook


class MockValidEpubCheck:
    def __init__(self, epub_path):
        self.valid = True
        self.messages = []


class MockValidEpubWithWarningsCheck:
    def __init__(self, epub_path):
        self.valid = False
        # Demo messages
        self.messages = [("0", "WARNING")]


class MockInvalidEpubCheck:
    def __init__(self, epub_path):
        self.valid = False
        # Demo messages
        self.messages = [("0", "WARNING"), ("1", "ERROR")]


def mock_unzipping(ebook_uuid, ebook_title):
    return "MOCKED_TITLE"


def dummy_mock(filepath):
    return True


class DataProcessingPipelineTests(TestCase):
    def setUp(self) -> None:
        self.uuid = uuid4()
        self.ebook = Ebook.objects.create(uuid=self.uuid)

    def test_check_missing_book(self):
        epub_path = "random invalid path"
        valid, message = check_ebook(epub_path)

        self.assertFalse(valid)
        self.assertEqual(message, ["Original .epub file not found!"])

    @patch("ebooks.utils.EpubCheck", MockValidEpubWithWarningsCheck)
    @patch("ebooks.utils.os.path.isfile", dummy_mock)
    def test_process_valid_ebook_with_warnings(self):
        epub_path = "random invalid path"
        valid, message = check_ebook(epub_path)

        self.assertTrue(valid)
        self.assertEqual(message, [("0", "WARNING")])

    @patch("ebooks.utils.EpubCheck", MockValidEpubCheck)
    @patch("ebooks.utils.os.path.isfile", dummy_mock)
    def test_process_valid_ebook_no_file_found(self):
        process_ebook(self.ebook)

        self.assertEqual(self.ebook.state, "CONVERTING")
        self.assertEqual(self.ebook.checker_issues, "[]")
        # Check that the ebook got deleted
        self.assertEqual(Ebook.objects.filter(uuid=self.uuid).count(), 0)

    @patch("ebooks.utils.EpubCheck", MockValidEpubCheck)
    @patch("ebooks.utils.unzip_ebook", mock_unzipping)
    @patch("ebooks.utils.os.path.isfile", dummy_mock)
    def test_process_valid_ebook_updated_title(self):
        process_ebook(self.ebook)

        self.assertEqual(self.ebook.state, "PROCESSED")
        self.assertEqual(self.ebook.title, "MOCKED_TITLE")

    @patch("ebooks.utils.EpubCheck", MockInvalidEpubCheck)
    @patch("ebooks.utils.os.remove", dummy_mock)
    @patch("ebooks.utils.os.path.isfile", dummy_mock)
    def test_process_invalid_ebook(self):
        process_ebook(self.ebook)

        self.assertEqual(self.ebook.state, "INVALID")
        self.assertEqual(self.ebook.checker_issues, '[["0", "WARNING"], ["1", "ERROR"]]')
