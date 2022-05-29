from django.db import models
from images.models import Image


class Annotation(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    ANNOTATION_TYPES = [
        ('BB_GOOGLE_LAB', 'Black-box Google Label'),
        ('BB_AZURE_LAB', 'Black-box Azure Label'),
        ('BB_AZURE_SEN', 'Black-box Azure Sentence'),
        ('CONTEXT_LAB', 'Context Bert Label'),
    ]
    type = models.CharField(max_length=30, choices=ANNOTATION_TYPES, default='BB_GOOGLE_LAB')
    text = models.CharField(max_length=200, default="")
    confidence = models.DecimalField(max_digits=5, decimal_places=4, default=1.0)
