from bs4 import BeautifulSoup
from .serializers import EbookSerializer
from .models import Ebook
from images.models import Image
from annotations.models import Annotation
from rest_framework import status
from django.http import JsonResponse
# import json


def ebook_detail_view(request, uuid):
    if request.method == "GET":
        serializer_class = EbookSerializer
        try:
            ebook = Ebook.objects.all().filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': 'Ebook Not Found!'}, status=status.HTTP_404_NOT_FOUND)
        serializer = serializer_class(ebook)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    return JsonResponse({'msg': 'Method Not Allowed!'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


def ebook_download_view(request, uuid):
    ebook = Ebook.objects.all().filter(uuid=uuid).get()

    images = Image.objects.all().filter(ebook=ebook).all()
    annotations = [a for a in Annotation.objects.all()
                   if a.image in images
                   if a.type == 'HUM']
    # annotations = Annotation.objects.all()\
    #     .filter(lambda a: a.image in images and a.type == 'HUM').all()

    # TODO: inject annotations in html files

    # assume a list of html files for that book
    htmls = []
    for image in images:
        image_annotation = filter(lambda a: a.image == image, annotations)
        html_file = filter(lambda h: h.path == image.location, htmls)
        # TODO: inject into that html file
        content = open(html_file)
        data = BeautifulSoup(content, 'html.parser')
        images_in_html = data.find_all('img', src=True)
        for im in images_in_html:
            if im['src'] == image.filename:
                im['alt'] = image_annotation

        with open(html_file, "w") as file:
            file.write(str(data))

    # zip contents
    # return zipped contents


def ebook_upload_view(request):
    pass
