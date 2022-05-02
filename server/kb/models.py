# import uuid
from django.db import models

# Create your models here.
# By default, blank (empty value in <form>) and null (empty value in db) are false.


class Ebook(models.Model):
    # The use of an UUID is mandatory for epub files
    # uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    uuid = models.CharField(primary_key=True, max_length=100, default='DEFAULT', unique=True)
    epub3_path = models.CharField(max_length=50)
    title = models.CharField(max_length=50)   # May not be necessary for our demo

# Many-to-one relationship between Ebook and Image


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

# Many-to-one relationship between Image and Annotation


class Annotation(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    ANNOTATION_TYPES = [
        ('BB', 'Black-box'),
        ('SMART', 'Smart AI'),
        ('HUM', 'Human')
    ]
    type = models.CharField(max_length=10, choices=ANNOTATION_TYPES, default='BB')
    text = models.CharField(max_length=500)
    confidence = models.DecimalField(max_digits=5, decimal_places=4)


# Intermediate model between Image and Annotation


class ImageAnnotated(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    annotation = models.ForeignKey(Annotation, on_delete=models.CASCADE)
    # Additional fields related to the annotation made on the image
    date_annotated = models.DateField()
    username = models.CharField(max_length=30)
