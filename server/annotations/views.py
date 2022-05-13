from .serializers import AnnotationSerializer
from .models import Annotation
from .utils import check_request_body, google_vision_labels
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status


@csrf_exempt
def annotation_generation_view(request):
    """ Receives the metadata for an image and sends
    a request to the AI to generate annotation for it
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
        # data = body[1]

        image_path = f"test-books/{image.ebook}/OEBPS/{image.filename}"

        # Calls the helper method in utils
        generated_labels = google_vision_labels(image_path)

        # Adds the each annotation from Google's API as a database entry
        for description, score in generated_labels.items():
            Annotation.objects.create(image=image,
                                      type="BB",
                                      text=description,
                                      confidence=score)

        return JsonResponse({'msg': f'Success, {len(generated_labels)} annotations added.'},
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
        annotation.save()
        serializer = AnnotationSerializer(annotation)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'msg': 'Method Not Allowed!'},
                            status=status.HTTP_405_METHOD_NOT_ALLOWED)
