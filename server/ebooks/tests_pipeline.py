from .models import Ebook
from .utils import check_ebook, process_ebook

from django.test import TestCase
from unittest.mock import patch
from uuid import uuid4


class MockedMessage:
    def __init__(self, id, level, location, message):
        self.id = id
        self.level = level
        self.location = location
        self.message = message

    def __eq__(self, other):
        return self.id == other.id and \
               self.level == other.level and \
               self.location == other.location and \
               self.message == other.message


class MockValidEpubCheck:
    def __init__(self, epub_path):
        self.valid = True
        self.messages = []


class MockValidEpubWithWarningsCheck:
    def __init__(self, epub_path):
        self.valid = False
        # Demo messages
        self.messages = [MockedMessage("0", "WARNING", "file.html", "MESSAGE")]


class MockInvalidEpubCheck:
    def __init__(self, epub_path):
        self.valid = False
        # Demo messages
        self.messages = [MockedMessage("0", "WARNING", "file.html", "WARNING_MESSAGE"),
                         MockedMessage("1", "ERROR", "file.html", "ERROR_MESSAGE")]


def mock_unzipping(epub_path, contents_dir):
    return "MOCKED_TITLE"


def mock_unzipping_with_error(epub_path, contents_dir):
    raise FileNotFoundError


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
        self.assertEqual(message, [MockedMessage("0", "WARNING", "file.html", "MESSAGE")])

    @patch("ebooks.utils.EpubCheck", MockValidEpubCheck)
    @patch("ebooks.utils.unzip_ebook", mock_unzipping_with_error)
    @patch("ebooks.utils.os.path.isfile", dummy_mock)
    def test_process_valid_ebook_no_file_found(self):
        process_ebook(self.ebook)

        self.assertEqual(self.ebook.state, "UNZIPPING_FAILED")
        self.assertEqual(self.ebook.checker_issues, "[]")

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
        self.assertEqual(self.ebook.checker_issues,
                         "['WARNING - 0 - file.html - WARNING_MESSAGE', "
                         "'ERROR - 1 - file.html - ERROR_MESSAGE']")
