from rest_framework import serializers
from .models import Annotation


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ('image', 'ANNOTATION_TYPES', 'type', 'text', 'confidence')
