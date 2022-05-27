from django.db import models
from ebooks.models import Ebook


class Image(models.Model):
    # When the referenced ebook gets deleted, the child image will be deleted too.
    ebook = models.ForeignKey(Ebook, on_delete=models.CASCADE)
    filename = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    IMAGE_TYPES = [
        ('DECO', 'Decoration'),
        ('INFO', 'Information'),
        ('PHOTO', 'Photo'),
        ('ILLUS', 'Illustration'),
        ('FIG', 'Figure'),
        ('SYM', 'Symbol'),
        ('ART', 'Art'),
        ('SIG', 'Signature'),
        ('TXT', 'Text'),
        ('FLAG', 'Flag'),
        ('COM', 'Comic'),
        ('LOGO', 'Logo'),
        ('GRAPH', 'Graph'),
        ('MAP', 'Map')
    ]
    SERIALIZED_FIELDS = ['ebook', 'filename', 'location', 'classification', 'raw_context']
    classification = models.CharField(max_length=10, choices=IMAGE_TYPES, default='INFO')
    raw_context = models.CharField(max_length=1000, blank=True)
    # keywords = array??

    class Meta:
        # Combine ebook and filename into a primary key
        unique_together = (("ebook", "filename"), )
