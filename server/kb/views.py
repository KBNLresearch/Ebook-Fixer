from rest_framework import viewsets
from .serializers import StudentSerializer
from .models import Student
from django.http import JsonResponse

# Create your views here.


class StudentView(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    queryset = Student.objects.all()


def api_home(request, *args, **kwargs):
    return JsonResponse({"message": "This should be the home page of the server!"})
