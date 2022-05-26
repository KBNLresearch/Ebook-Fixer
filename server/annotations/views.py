from .serializers import AnnotationSerializer
from .models import Annotation
from .utils import check_request_body, google_vision_labels
from .utils import azure_api_call
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status


@csrf_exempt
def google_annotation_generation_view(request):
    """ Receives the metadata for an image and sends
    a request to GOOGLE VISON AI to generate annotation for it
    The annotations for save in the database.

    Args:
        request (request object): The request with the image
        metadata in the body

    Returns:
        JsonResponse: Response object sent back to the client
    """
    if request.method == "PUT":
        body = check_request_body(request)
        if type(body) == JsonResponse:
            return body
        image = body[0]
        image_path = f"test-books/{image.ebook}/{image.filename}"

        # Check if annotation for given type already exists in the database
        existing_annotations = [
            a for a in Annotation.objects.all()
            if a.image == image
            if a.type == "BB_GOOGLE_LAB"
        ]
        if len(existing_annotations) != 0:
            existing_annotations = list(map(lambda a: AnnotationSerializer(a).data,
                                        existing_annotations))

            return JsonResponse({"annotations": existing_annotations},
                                status=status.HTTP_200_OK)

        try:
            # Calls the helper method in utils

            # TODO For production comment line below and uncomment line below that
            # generated_labels = mocked_google_vision_labels()
            generated_labels = google_vision_labels(image_path)
        except FileNotFoundError:
            return JsonResponse({'msg': f'Img {image.filename} in ebook {image.ebook} not found'},
                                status=status.HTTP_404_NOT_FOUND)

        annotations = []

        # Adds each annotation from Google's API as a database entry
        for description, score in generated_labels.items():
            annotations.append(Annotation.objects.create(image=image,
                               type="BB_GOOGLE_LAB",
                               text=description,
                               confidence=score))

        annotations = list(map(lambda a: AnnotationSerializer(a).data, annotations))

        return JsonResponse({"annotations": annotations},
                            status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def azure_annotation_generation_view(request):
    """ Receives the metadata for an image and sends
    a request to AZURE VISON AI to generate annotation for it
    The annotations for save in the database.

    Args:
        request (request object): The request with the image
        metadata in the body

    Returns:
        JsonResponse: Response object sent back to the client
    """
    if request.method == "PUT":
        body = check_request_body(request)
        if type(body) == JsonResponse:
            return body
        image = body[0]
        image_path = f"test-books/{image.ebook}/{image.filename}"

        # Check if annotation for given type already exists in the database
        existing_annotations = [
            a for a in Annotation.objects.all()
            if a.image == image
            if a.type == "BB_AZURE_LAB" or a.type == "BB_AZURE_SEN"
        ]
        if len(existing_annotations) != 0:
            existing_annotations = list(map(lambda a: AnnotationSerializer(a).data,
                                        existing_annotations))

            return JsonResponse({"annotations": existing_annotations},
                                status=status.HTTP_200_OK)

        try:
            # Calls the helper method in utils

            # TODO For production comment line below and uncomment line below that
            # generated_sentence, generated_labels = mocked_azure_api_call()
            generated_sentence, generated_labels = azure_api_call(image_path)
        except FileNotFoundError:
            return JsonResponse({'msg': f'Img {image.filename} in ebook {image.ebook} not found'},
                                status=status.HTTP_404_NOT_FOUND)

        annotations = []

        # Adds each annotation from Google's API as a database entry
        for description, score in generated_labels.items():
            annotations.append(Annotation.objects.create(image=image,
                               type="BB_AZURE_LAB",
                               text=description,
                               confidence=score))

        # Adds Azure's generated sentence to database
        Annotation.objects.create(image=image,
                                  type="BB_AZURE_SEN",
                                  text=generated_sentence)

        annotations = list(map(lambda a: AnnotationSerializer(a).data, annotations))

        return JsonResponse({"annotations": annotations, "sentence": generated_sentence},
                            status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)


@csrf_exempt
def annotation_save_view(request):
    """ Receives the metadata for an image and updates the text of
    its human annotation if the entry exists, otherwise, it creates
    a new one

    Args:
        request (request object): The request with the image
        metadata in the body

    Returns:
        JsonResponse: Response object sent back to the client
    """
    if request.method == "POST":
        body = check_request_body(request)
        if type(body) == JsonResponse:
            return body
        image = body[0]
        data = body[1]
        try:
            # Check if a human annotation already exists
            annotation = Annotation.objects.filter(image=image, type="HUM").get()
        except Annotation.DoesNotExist:
            annotation = Annotation.objects.create(image=image, type="HUM")
        annotation.text = data["text"]
        annotation.save(update_fields=["text"])
        serializer = AnnotationSerializer(annotation)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
