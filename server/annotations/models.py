from django.db import models
from images.models import Image


class Annotation(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    ANNOTATION_TYPES = [
        ('GG', 'Google Vision API'),
        ('MS', 'Microsoft Azure Vision API'),
        ('HUM', 'Human')
    ]
    type = models.CharField(max_length=10, choices=ANNOTATION_TYPES, default='GG')
    text = models.CharField(max_length=200, default="")
    confidence = models.DecimalField(max_digits=5, decimal_places=4, default=1.0)
