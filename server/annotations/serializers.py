from .models import Annotation

from rest_framework import serializers


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ('id', 'image', 'type', 'text', 'confidence')
