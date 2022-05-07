import uuid
from django.db import models


class Ebook(models.Model):
    # The use of a UUID is mandatory for epub files
    # Include option editable=False ??
    uuid = models.CharField(primary_key=True, max_length=100, default=uuid.uuid4, unique=True)
    epub3_path = models.CharField(max_length=100)
    title = models.CharField(max_length=50, blank=True, default='')
