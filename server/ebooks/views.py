from .serializers import EbookSerializer
from .models import Ebook
from .utils import inject_image_annotations, zip_ebook
from images.models import Image
from annotations.models import Annotation

from django.http import JsonResponse
from django.http import HttpResponse
from rest_framework import status
import os


def ebook_detail_view(request, uuid):
    """The GET endpoint for an ebook instance

    Args:
        request (request object): The request object
        uuid (str): The UUID of an already uploaded ebook

    Returns:
        JsonResponse: Response object sent to the client side
    """
    if request.method == "GET":
        try:
            ebook = Ebook.objects.all().filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': f'Ebook with uuid {uuid} not found!'},
                                status=status.HTTP_404_NOT_FOUND)
        serializer = EbookSerializer(ebook)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    return JsonResponse({'msg': 'Method Not Allowed!'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


def ebook_download_view(request, uuid):
    """Endpoint for zipping the ebook with given uuid from storage and reutrns the epub

    Args:
        request (request object): The request object
        uuid (str): The UUID of an already uploaded ebook

    Returns:
        JsonResponse: Response object sent to the client side
    """
    if request.method == "GET":
        try:
            ebook = Ebook.objects.all().filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': f'Ebook with uuid {uuid} not found!'},
                                status=status.HTTP_404_NOT_FOUND)
        images = Image.objects.all().filter(ebook=ebook).all()
        annotations = [
            a for a in Annotation.objects.all()
            if a.image in images
            if a.type == 'HUM'
        ]

        # Get the html files from the storage
        storage_path = f"test-books/{uuid}"
        html_files = []
        for folder_name, sub_folders, filenames in os.walk(storage_path):
            for filename in filenames:
                if filename.endswith(".html"):
                    html_files.append(filename)

        # Inject image annotations into the html files
        inject_image_annotations(uuid, html_files, images, annotations)

        try:
            # Zip contents
            print(f"Zipping ebook with uuid: {uuid}")
            zip_file_name = zip_ebook(uuid)

            # Return zipped contents
            with open(zip_file_name, 'rb') as file:
                response = HttpResponse(file, content_type='application/epub+zip')
                response['Content-Disposition'] = f'attachment; filename={zip_file_name}'
                return response
        except FileNotFoundError:
            return JsonResponse({'msg': f'Files for ebook with uuid {uuid} not found! '
                                        f'Zipping failed!'},
                                status=status.HTTP_404_NOT_FOUND)
    return JsonResponse({'msg': 'Method Not Allowed!'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


def ebook_upload_view(request):
    return JsonResponse({'msg': 'All good here!'}, status=status.HTTP_200_OK)
