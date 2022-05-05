from xml.dom.minidom import Document
from rest_framework import viewsets
from .serializers import EbookSerializer
from .models import Ebook
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
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
        return Response(serializer.data, status=status.HTTP_200_OK)



    @action(detail=False, methods=["post"], url_path=r'upload',)
    def upload(self, request):

        print('\n\n\n ########################################## request.FILES:\n')  
        print(request.FILES, '\n')              
        print(request.FILES['epub'].file)  
        print('\n########################################## \n\n\n')

        book_id = str(uuid.uuid4())
        # binary_epub = request.FILES['epub'].file
        epub_name = request.FILES['epub'].name
        
        # Check if file extension is  .epub
        file_ext = epub_name[-5:]
        if file_ext == '.epub':
            # TODO: Extract title from HTML
            new_ebook = Ebook(book_id, epub_name, request.FILES['epub'])
            new_ebook.save()

            # TODO: Make accessible (Aratrika)
                
            # TODO: Return accessible epub file as response to client in Response

            return Response(data='<accessible ebook>', status=status.HTTP_200_OK)
        else: 
            return Response(data='Make sure your uploaded file has extension .epub!', status=status.HTTP_400_BAD_REQUEST)






