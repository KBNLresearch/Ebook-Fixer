from django.db import models


def epub_dir_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/{uuid}
    return '{0}/{1}'.format(str(instance.uuid), filename)


class Ebook(models.Model):
    uuid = models.CharField(primary_key=True, max_length=100, default="DEFAULT_UUID", unique=True)
    title = models.CharField(max_length=100, blank=True, default='DEFAULT_TITLE')
    # The files uploaded to FileField are not stored in the database but in the filesystem (under MEDIA_ROOT/...) # noqa: E501
    # FileField is created as a string field in the database (usually VARCHAR), containing the reference to the actual file # noqa: E501
    epub = models.FileField(upload_to=epub_dir_path)
    VALID_STATES = [
        # First step of the pipeline
        ('VALIDATING', 'validating'),
        # If this is the state we can conclude that the book is valid
        ('UNZIPPING', 'unzipping'),
        # If this is the state we can conclude that the book is valid, and it was unzipped
        ('CONVERTING', 'converting'),
        # If this is the state we can conclude that the book is valid and an ePub3
        ('MAKING_ACCESSIBLE', 'making_accessible'),
        # If this is the state we can conclude that the book is valid, an ePub3 and accessible
        ('PROCESSED', 'processed')
    ]
    # If the state is any of these then the first time the client requests the metadata for this book, it will be deleted # noqa: E501
    INVALID_STATES = [
        ('INVALID', 'invalid'),
        ('UNZIPPING_FAILED', 'unzipping_failed'),
        ('CONVERSION_FAILED', 'conversion_failed'),
        ('NOT_ACCESSIBLE', 'not_accessible')
    ]
    STATES = VALID_STATES + INVALID_STATES
    state = models.CharField(max_length=17, choices=STATES, default='VALIDATING')
    checker_issues = models.TextField(max_length=3000, default='')

    def __str__(self) -> str:
        return self.uuid
