from .models import Image

from rest_framework import serializers


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('id', 'ebook', 'filename', 'location', 'classification', 'raw_context')
