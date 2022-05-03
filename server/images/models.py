from django.db import models
from ebooks.models import Ebook

# Create your models here.


class Image(models.Model):
    # When the referenced ebook gets deleted, the child image will be deleted too.
    ebook = models.ForeignKey(Ebook, on_delete=models.CASCADE)
    # For now location = file path,
    # but we may turn it into an object containing more fields later (e.g. line no.)
    location = models.CharField(max_length=50, default='DEFAULT')
    IMAGE_TYPES = [
        ('DECO', 'Decorative'),
        ('INFO', 'Informative'),
        ('PHOTO', 'Photo'),
        ('ILLUS', 'Illustration'),
        ('FIG', 'Figure'),
        ('SYM', 'Symbol'),
        ('DRAW', 'Drawing'),
        ('COM', 'Comic'),
        ('LOGO', 'Logo'),
        ('GRAPH', 'Graph'),
        ('MAP', 'Map')
    ]
    classification = models.CharField(max_length=10, choices=IMAGE_TYPES, default='DECO')
    raw_context = models.CharField(max_length=1000)
    # keywords = array??
