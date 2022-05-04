from .serializers import EbookSerializer
from .models import Ebook
from .utils import inject_image_annotations
from images.models import Image
from annotations.models import Annotation

from django.http import JsonResponse
from rest_framework import status
# import json


def ebook_detail_view(request, uuid):
    if request.method == "GET":
        try:
            ebook = Ebook.objects.all().filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': 'Ebook Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EbookSerializer(ebook)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    return JsonResponse({'msg': 'Method Not Allowed!'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


def ebook_download_view(request, uuid):
    ebook = Ebook.objects.all().filter(uuid=uuid).get()

    images = Image.objects.all().filter(ebook=ebook).all()
    annotations = [a for a in Annotation.objects.all()
                   if a.image in images
                   if a.type == 'HUM']

    # assume a list of html files for that book
    html_files = []

    inject_image_annotations(html_files, images, annotations)

    # zip contents
    # return zipped contents


def ebook_upload_view(request):
    pass
