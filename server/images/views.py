from .serializers import ImageSerializer
from .models import Image
from ebooks.models import Ebook
from annotations.models import Annotation
from annotations.serializers import AnnotationSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from json import JSONDecodeError
import json


def image_details_view(request, filename):
    """Returns the metadata and the annotations for an image

    Args:
        request (request object): The request object with an ebook header
        filename (string): The name of the image

    Returns:
        JsonResponse: Response object sent back to the client
    """
    if request.method == "GET":
        try:
            uuid = request.headers["ebook"]
        except KeyError:
            return JsonResponse({'msg': 'Ebook header not found in the request!'},
                                status=status.HTTP_400_BAD_REQUEST)
        try:
            ebook = Ebook.objects.filter(uuid=uuid).get()
        except Ebook.DoesNotExist:
            return JsonResponse({'msg': f'Ebook with uuid {uuid} not found!'},
                                status=status.HTTP_404_NOT_FOUND)
        try:
            image = Image.objects.filter(ebook=ebook, filename=filename).get()
        except Image.DoesNotExist:
            return JsonResponse({'msg': f'Image {filename} not found in ebook {uuid}!'},
                                status=status.HTTP_404_NOT_FOUND)
        annotations = [
            a for a in Annotation.objects.all()
            if a.image == image
        ]
        image_serializer = ImageSerializer(image)
        annotations = list(map(lambda a: AnnotationSerializer(a).data, annotations))
        return JsonResponse({'image': image_serializer.data,
                             'annotations': annotations
                             }, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def image_classification_view(request):
    """Receives metadata for an image entry which is
    added/updated in the database

    Args:
        request (request object): The request object that contains
        image metadata in the body

    Returns:
        JsonResponse: Response object sent back to the client
    """
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
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
