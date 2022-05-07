from rest_framework import viewsets
from .serializers import AnnotationSerializer
from .models import Annotation


class AnnotationView(viewsets.ModelViewSet):
    serializer_class = AnnotationSerializer
    queryset = Annotation.objects.all()
