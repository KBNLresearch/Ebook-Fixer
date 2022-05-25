from .serializers import EbookSerializer
from .models import Ebook
from .utils import (
    inject_image_annotations,
    zip_ebook,
    push_epub_folder_to_github,
    process_ebook
)
from images.models import Image
from annotations.models import Annotation
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.datastructures import MultiValueDictKeyError
from rest_framework import status
from _thread import start_new_thread
from os import environ
import uuid


def ebook_detail_view(request, uuid):
    """ The endpoint for retrieving the metadata for a book.

    Args:
        request (request object): the request object
        uuid (uuid): the UUID of an already uploaded ebook

    Returns:
        JsonResponse: a message in case of an error or the metadata for the book
    """
    if request.method == "GET":
        try:
            ebook = Ebook.objects.all().filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': f'Ebook with uuid {uuid} not found!'},
                                status=status.HTTP_404_NOT_FOUND)
        serializer = EbookSerializer(ebook)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


def ebook_download_view(request, uuid):
    """ The endpoint for zipping the ebook contents from storage

    Args:
        request (request object): the request object
        uuid (str): the UUID of an already uploaded ebook

    Returns:
        JsonResponse: a message in case of an error of the zipped epub
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
        # Inject image annotations into the html files
        inject_image_annotations(str(uuid), images, annotations)
        # Push new contents to GitHub if mode is 'production'
        if environ.get('GITHUB_MODE', "development") == "production":
            message = f"Download {uuid}"
            push_epub_folder_to_github(str(uuid), message)
        try:
            # Zip contents
            zip_file_name = zip_ebook(str(uuid))

            # Return zipped contents
            with open(zip_file_name, 'rb') as file:
                response = HttpResponse(file, content_type='application/epub+zip')
                response['Content-Disposition'] = f'attachment; filename={zip_file_name}'
                return response
        except FileNotFoundError:
            return JsonResponse({'msg': f'Files for ebook with uuid {uuid} not found! '
                                        f'Zipping failed!'},
                                status=status.HTTP_404_NOT_FOUND)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def ebook_upload_view(request):
    """ Takes the epub from the request and unzips it under test-books/{uuid}/.
        Starts processing the epub in a new thread.

        Args:
            request (request object): the request object with an 'epub' key

        Returns:
            JSONResponse: a message in case of an error of uuid of the newly added book
    """
    if request.method == "POST":
        # Generate random uuid for new ebook instance
        ebook_uuid = str(uuid.uuid4())
        # Check if key 'epub' exists in MultiValueDictionary
        try:
            # Check if key 'epub' exists in MultiValueDictionary
            uploaded_epub = request.FILES['epub']
            epub_name = request.FILES['epub'].name
        except MultiValueDictKeyError:
            return JsonResponse({'msg': 'No epub file found in request!'},
                                status=status.HTTP_400_BAD_REQUEST)
        # Check if file extension is .epub
        file_ext = epub_name[-5:]
        if file_ext == '.epub':
            ebook = Ebook.objects.create(uuid=ebook_uuid, title=epub_name, epub=uploaded_epub)
            start_new_thread(process_ebook, (ebook,))
            return JsonResponse({'book_id': ebook_uuid, 'title': epub_name},
                                status=status.HTTP_200_OK)
        else:
            return JsonResponse({'msg': 'Make sure your uploaded file has extension .epub!'},
                                status=status.HTTP_400_BAD_REQUEST)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
