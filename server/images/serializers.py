from rest_framework import serializers
from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('ebook', 'location', 'IMAGE_TYPES', 'classification', 'raw_context')
