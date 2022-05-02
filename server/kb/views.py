from django.http import HttpResponse
from rest_framework import viewsets
from .serializers import ImageSerializer, EbookSerializer
from .serializers import AnnotationSerializer, ImageAnnotatedSerializer
from .models import Image, Ebook, Annotation, ImageAnnotated

# from django.shortcuts import render


# Create your views here.
def main(request):
    return HttpResponse("Hello World!!!!!!!")


class EbookView(viewsets.ModelViewSet):
    serializer_class = EbookSerializer
    queryset = Ebook.objects.all()


class ImageView(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all()


class AnnotationView(viewsets.ModelViewSet):
    serializer_class = AnnotationSerializer
    queryset = Annotation.objects.all()


class ImageAnnotatedView(viewsets.ModelViewSet):
    serializer_class = ImageAnnotatedSerializer
    queryset = ImageAnnotated.objects.all()
