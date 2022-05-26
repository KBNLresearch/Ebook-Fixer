from django.db import models
from images.models import Image


class Annotation(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    ANNOTATION_TYPES = [
        ('BB_GOOGLE_LAB', 'Black-box Google Label'),
        ('BB_AZURE_LAB', 'Black-box Azure Label'),
        ('BB_AZURE_SEN', 'Black-box Azure Sentence'),
        ('SMART', 'Smart AI'),
        ('HUM', 'Human')
    ]
    type = models.CharField(max_length=15, choices=ANNOTATION_TYPES, default='HUM')
    text = models.CharField(max_length=200)
    confidence = models.DecimalField(max_digits=5, decimal_places=4, default=1.0)
