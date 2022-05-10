from .serializers import ImageSerializer
from .models import Image
from ebooks.models import Ebook
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from json import JSONDecodeError
import json


@csrf_exempt
def image_classification_view(request):
    if request.method == "PUT":
        try:
            data = request.body.decode('utf-8')
            data = json.loads(data)
        except JSONDecodeError:
            return JsonResponse({'msg': 'No data found in the request!'},
                                status=status.HTTP_400_BAD_REQUEST)
        try:
            field_names = Image.SERIALIZED_FIELDS
            if not set(data.keys()).issubset(set(field_names)):
                return JsonResponse({'msg': 'The body of the request has fields '
                                            'that are not supported!'},
                                    status=status.HTTP_400_BAD_REQUEST)
            ebook = Ebook.objects.filter(uuid=data["ebook"]).get()
            try:
                image = Image.objects.filter(ebook=ebook, filename=data["filename"]).get()
            except Image.DoesNotExist:
                image = Image.objects.create(ebook=ebook,
                                             filename=data["filename"],
                                             location=data["location"])
        except KeyError:
            return JsonResponse({'msg': 'The body of the request is not in the correct format!'},
                                status=status.HTTP_400_BAD_REQUEST)
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': f'Ebook with uuid {data["ebook"]} not found!'},
                                status=status.HTTP_404_NOT_FOUND)
        try:
            if data["classification"] in map(lambda t: t[1], Image.IMAGE_TYPES):
                image.classification = data["classification"]
            else:
                return JsonResponse({'msg': 'This type of image is not in supported!'},
                                    status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            pass
        try:
            image.raw_context = data["raw_context"]
        except KeyError:
            pass
        image.save()
        serializer = ImageSerializer(image)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    return JsonResponse({'msg': 'Method Not Allowed!'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
