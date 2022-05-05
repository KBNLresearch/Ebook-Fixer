from rest_framework import viewsets
from .serializers import EbookSerializer
from .models import Ebook
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
import zipfile
import uuid 
import os
# Create your views here.



class EbookView(viewsets.ModelViewSet):
    serializer_class = EbookSerializer
    queryset = Ebook.objects.all()
    

    # This will (check if it exists in DB) then get the file from local storage, zip it to an epub and return to client
    @action(detail=True, methods=["get"], url_path=r'download',)
    def download(self, request, pk=None):
        post = self.get_object() # the ebook object
        print(post.get_path())
        print(post)
        serializer = self.get_serializer(post)
        return JsonResponse({'data': serializer.data}, status=status.HTTP_200_OK)


    @action(detail=False, methods=["post"], url_path=r'upload',)
    def upload(self, request):
        # Generate random uuid for new ebook instance
        book_id = str(uuid.uuid4())
        uploaded_epub = request.FILES['epub']
        binary_epub = request.FILES['epub'].file
        epub_name = request.FILES['epub'].name
        
        # Check if file extension is .epub
        file_ext = epub_name[-5:]
        if file_ext == '.epub':
            # TODO: Extract title from content.opf
            new_ebook = Ebook(book_id, epub_name, uploaded_epub)
            new_ebook.save()

            # Unzip the epub file stored on the server
            with zipfile.ZipFile(f"/app/test-ebooks/{book_id}/{epub_name}", 'r') as zipped_epub:
                zipped_epub.extractall(f"/app/test-ebooks/{book_id}")

            # TODO: Make accessible (Aratrika)
            # TODO: Convert epub2 to epub3 
                
            # TODO: Return accessible epub3 file (convert to JSON??) + bookid as response to client in Response

            return JsonResponse({'data':f"New ebook entry created with uuid {book_id}"}, status=status.HTTP_200_OK)
            # return JsonResponse({'data': binary_epub}, status=status.HTTP_200_OK)
        else: 
            return JsonResponse({'data':'Make sure your uploaded file has extension .epub!'}, status=status.HTTP_400_BAD_REQUEST)






