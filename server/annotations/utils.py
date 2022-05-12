from images.models import Image
from ebooks.models import Ebook
from django.http import JsonResponse
from rest_framework import status
from json import JSONDecodeError
import json


def check_request_body(request):
    try:
        data = request.body.decode('utf-8')
        data = json.loads(data)
    except JSONDecodeError:
        return JsonResponse({'msg': 'No data found in the request!'},
                            status=status.HTTP_400_BAD_REQUEST)
    try:
        ebook = Ebook.objects.filter(uuid=data["ebook"]).get()
        image = Image.objects.filter(id=data["id"], ebook=ebook, filename=data["filename"]).get()
    except KeyError:
        return JsonResponse({'msg': 'The body of the request is not in the correct format!'},
                            status=status.HTTP_400_BAD_REQUEST)
    except Ebook.DoesNotExist:
        return JsonResponse({'msg': f'Ebook with uuid {data["ebook"]} not found!'},
                            status=status.HTTP_404_NOT_FOUND)
    except Image.DoesNotExist:
        return JsonResponse({'msg': f'Image with id {data["id"]} '
                                    f'and ebook with uuid {data["ebook"]} not found!'},
                            status=status.HTTP_404_NOT_FOUND)
    return image, data
