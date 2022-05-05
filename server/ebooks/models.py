import uuid

from django.db import models

# Create your models here.

def epub_dir_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/{uuid}
    return '{0}'.format(instance.uuid)

class Ebook(models.Model):
    uuid = models.CharField(primary_key=True, max_length=100, default="DEFAULT", unique=True)
    title = models.CharField(max_length=50, blank=True, default='')
    # The files uploaded to FileField or ImageField are not stored in the database but in the filesystem.
    # FileField and ImageField are created as a string field in the database (usually VARCHAR), containing the reference to the actual file.
    epub = models.FileField(upload_to=epub_dir_path)    # The files will be automatically uploaded to MEDIA_ROOT/...
    
    def __str__(self) -> str:
        return self.uuid