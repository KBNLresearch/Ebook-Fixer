from rest_framework import serializers
from .models import Image, Ebook, Annotation, ImageAnnotated


class EbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ebook
        fields = ('uuid', 'epub3_path', 'title')


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('ebook', 'location', 'IMAGE_TYPES', 'classification', 'raw_context')


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ('image', 'ANNOTATION_TYPES', 'type', 'text', 'confidence')


class ImageAnnotatedSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageAnnotated
        fields = ('image', 'annotation', 'date_annotated', 'username')
