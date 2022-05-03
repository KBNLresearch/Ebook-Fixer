from rest_framework import viewsets
from .serializers import EbookSerializer
from .models import Ebook
# Create your views here.


class EbookView(viewsets.ModelViewSet):
    serializer_class = EbookSerializer
    queryset = Ebook.objects.all()
