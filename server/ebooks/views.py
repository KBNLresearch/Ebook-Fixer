from rest_framework import viewsets
from .serializers import EbookSerializer
from .models import Ebook
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
import json
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


    # This will add the unzipped epub file into local storage, then create DB entry with uuid, title
    @action(detail=False, methods=["post"], url_path=r'upload',)
    def upload(self, request):
        if request.method == 'POST':
            # json_data = json.loads(request.body)
            
            return JsonResponse({'msg':'Upload GUD'})
        return JsonResponse({'msg':'Upload BAD'})
