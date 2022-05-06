from .serializers import EbookSerializer
from .models import Ebook
from rest_framework.decorators import action
from django.http import JsonResponse
from django.http import HttpResponse
from rest_framework import status
import zipfile
import uuid
from .utils import inject_image_annotations, zip_ebook
from images.models import Image
from annotations.models import Annotation
import os

# class EbookView(viewsets.ModelViewSet):
#     serializer_class = EbookSerializer
#     queryset = Ebook.objects.all()

    # @action(detail=False, methods=["post"], url_path=r'upload',)
    # def upload(self, request):

    #     # print('\n\nRequest.body: ', request.body)
    #     #  <MultiValueDict: {'epub': [<InMemoryUploadedFile: pg84.epub
    #     #                     (application/epub+zip)>]}
    #     # print('\n\nrequest.FILES: ', request.FILES)

    #     # Generate random uuid for new ebook instance
    #     book_id = str(uuid.uuid4())
    #     uploaded_epub = request.FILES['epub']
    #     # binary_epub = request.FILES['epub'].file
    #     epub_name = request.FILES['epub'].name

    #     # Check if file extension is .epub
    #     file_ext = epub_name[-5:]
    #     if file_ext == '.epub':
    #         # TODO: Extract title from content.opf ?
    #         new_ebook = Ebook(book_id, epub_name, uploaded_epub)
    #         new_ebook.save()

    #         # Unzip the epub file stored on the server
    #         with zipfile.ZipFile(f"/app/test-books/{book_id}/{epub_name}", 'r') as zipped_epub:
    #             zipped_epub.extractall(f"/app/test-books/{book_id}")

    #         # TODO: Make accessible (Aratrika)
    #         # TODO: Convert epub2 to epub3

    #         # TODO: Return accessible epub3 file (convert to JSON??)
    #         #       + bookid as response to client in Response

    #         return JsonResponse({'book_id': str(book_id),
    #                             'accessible_epub3': '<JSON_epub_file>'},
    #                             status=status.HTTP_200_OK)
    #         # return JsonResponse({'data': binary_epub}, status=status.HTTP_200_OK)
    #     else:
    #         return JsonResponse({'data': 'Make sure your uploaded file has extension .epub!'},
    #                             status=status.HTTP_400_BAD_REQUEST)

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


def ebook_upload_view(request):
    pass
