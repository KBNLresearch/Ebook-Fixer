from .serializers import EbookSerializer
from .models import Ebook
from .utils import inject_image_annotations, unzip_ebook, zip_ebook, push_epub_to_github
from images.models import Image
from annotations.models import Annotation
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.datastructures import MultiValueDictKeyError
from rest_framework import status
import uuid
import os


def ebook_detail_view(request, uuid):
    """ The GET endpoint for an ebook instance

    Args:
        request (request object): The request object
        uuid (uuid): The UUID of an already uploaded ebook

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
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


def ebook_download_view(request, uuid):
    """ Endpoint for zipping the ebook with given uuid from storage and returns the epub

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
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def ebook_upload_view(request):
    """ Takes the epub from the request and unzips it under test-books/{uuid}/

        Args:
            request (request object): client request

        Returns:
            JSONResponse: Response object sent to client
            containing the uuid for the newly created ebook
    """
    if request.method == "POST":
        # Generate random uuid for new ebook instance
        book_uuid = str(uuid.uuid4())
        # Check if key 'epub' exists in MultiValueDictionary
        try:
            uploaded_epub = request.FILES['epub']
            # binary_epub = request.FILES['epub'].file
            epub_name = request.FILES['epub'].name
        except MultiValueDictKeyError:
            return JsonResponse({'msg': 'No epub file found in request!'},
                                status=status.HTTP_400_BAD_REQUEST)

        # Check if file extension is .epub
        file_ext = epub_name[-5:]
        if file_ext == '.epub':
            # Automatically stores the uploaded epub under MEDIA_ROOT/{uuid}/{filename}
            new_ebook = Ebook(book_uuid, epub_name, uploaded_epub)
            new_ebook.save()
            # Unzip the epub file stored on the server, under MEDIA_ROOT/{uuid}
            # Returns the extracted title, which override the title
            try:
                ebook_title = unzip_ebook(book_uuid, epub_name)
                push_epub_to_github(book_uuid)
            except FileNotFoundError:
                return JsonResponse({'msg': 'Something went wrong! Please try again!'},
                                    status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            new_ebook.title = ebook_title
            new_ebook.save(update_fields=["title"])
            return JsonResponse({'book_id': str(book_uuid), 'title': ebook_title},
                                status=status.HTTP_200_OK)
        else:
            return JsonResponse({'msg': 'Make sure your uploaded file has extension .epub!'},
                                status=status.HTTP_400_BAD_REQUEST)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
