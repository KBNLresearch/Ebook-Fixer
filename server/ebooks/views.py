from .serializers import EbookSerializer
from .models import Ebook
from django.http import JsonResponse
from django.http import HttpResponse
from rest_framework import status
import uuid
from .utils import inject_image_annotations, unzip_ebook, zip_ebook
from images.models import Image
from annotations.models import Annotation
import os
from django.views.decorators.csrf import csrf_exempt


def ebook_detail_view(request, uuid):
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
    if request.method == "GET":
        try:
            ebook = Ebook.objects.all().filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': f'Ebook with uuid {uuid} not found!'},
                                status=status.HTTP_404_NOT_FOUND)
        images = Image.objects.all().filter(ebook=ebook).all()
        annotations = [a for a in Annotation.objects.all()
                       if a.image in images
                       if a.type == 'HUM']

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
            print(f"Zipping: {uuid}")
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


# TODO: Make accessible (Aratrika)
# TODO: Convert epub2 to epub3
# TODO: Return accessible epub3 file (or have separate endpoint)
@csrf_exempt
def ebook_upload_view(request):
    """ Takes the existing unzipped epub file under ./app/test-books/{uuid}/{filename}
        and unzips it, now under ./app/test-books/{uuid}
        Note that the MEDIA_ROOT is defined as ./app/test-books/

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
        if 'epub' in request.FILES:
            uploaded_epub = request.FILES['epub']
            # binary_epub = request.FILES['epub'].file
            epub_name = request.FILES['epub'].name
        else:
            return JsonResponse({'msg': 'No epub file found in request!'},
                                status=status.HTTP_404_NOT_FOUND)

        # Check if file extension is .epub
        file_ext = epub_name[-5:]
        if file_ext == '.epub':
            new_ebook = Ebook(book_uuid, epub_name, uploaded_epub)
            # Automatically stores the uploaded epub under MEDIA_ROOT/{uuid}/{filename}

            new_ebook.save()
            # Unzip the epub file stored on the server, under MEDIA_ROOT/{uuid}
            # Returns the extracted title, which override the title
            ebook_title = unzip_ebook(book_uuid, epub_name)
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
