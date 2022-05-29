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


def image_details_view(request):
    """ GET endpoint for returning the metadata and the annotations for an image

    Args:
        request (request object): The request object
            - ebook: e-book to which the image belongs to (header)
            - image: id of image to get metadata of (query param)

    Returns:
        JsonResponse: Response object sent back to the client
            - image (Image): image object
            - annotations (Annotation[]): list of all types of annotations for that image
    """
    if request.method == "GET":
        try:
            uuid = request.headers["ebook"]
        except KeyError:
            return JsonResponse({'msg': 'Ebook header not found in the request!'},
                                status=status.HTTP_400_BAD_REQUEST)
        filename = request.GET.get("image")
        if filename is None:
            return JsonResponse({'msg': 'Image parameter not found in the request!'},
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
    """ PUT endpoint for receiving metadata for an image entry which is
    added/updated in the database

    Args:
        request (request object): The request object
            - uuid (str): id of e-book which the image belongs to (body)
            - filename (str): full path of image (body)
            - location (str): file name in which image appears, often html (body)
            - classification (str): classification to store for image (body)
            - raw_context (str): textual context around image (body)

    Returns:
        JsonResponse: Response object sent back to the client
            - Image (Image) with classification field updated
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
                if image.classification == "Decoration":
                    try:
                        annotation = Annotation.objects.filter(image=image, type="HUM").get()
                        annotation.text = ""
                        annotation.save(update_fields=["text"])
                    except Annotation.DoesNotExist:
                        Annotation.objects.create(image=image, type="HUM")
            else:
                return JsonResponse({'msg': 'This type of image is not in supported!'},
                                    status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            pass
        try:
            image.raw_context = data["raw_context"]
        except KeyError:
            pass
        image.save(update_fields=["classification", "raw_context"])
        serializer = ImageSerializer(image)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
