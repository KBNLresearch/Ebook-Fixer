import uuid

from django.db import models

# Create your models here.


class Ebook(models.Model):
    # The use of a UUID is mandatory for epub files
    # Include option editable=False ??
    uuid = models.CharField(primary_key=True, max_length=100, default="DEFAULT", unique=True, editable=False)
    epub3_path = models.CharField(max_length=50)
    title = models.CharField(max_length=50, blank=True, default='')

    def get_path(self) -> str:
        return self.epub3_path
    
    def __str__(self) -> str:
        return self.epub3_path