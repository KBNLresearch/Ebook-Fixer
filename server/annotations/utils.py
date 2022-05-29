from images.models import Image
from ebooks.models import Ebook
from django.http import JsonResponse
from rest_framework import status
from json import JSONDecodeError
import json
import io
import os
from google.cloud import vision
import requests


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


def mocked_azure_api_call():
    description = "This is an example automated sentecne."
    generated_labels = dict()
    generated_labels["Development"] = 0.9582
    generated_labels["Mocked"] = 0.8346
    generated_labels["Testing"] = 0.8313
    return description, generated_labels


def mocked_google_vision_labels():
    generated_labels = dict()
    generated_labels["Development"] = 0.9582
    generated_labels["Mocked"] = 0.8346
    generated_labels["Testing"] = 0.8313
    return generated_labels


def google_vision_labels(image_path):
    # Instantiates a client
    client = vision.ImageAnnotatorClient()

    # The name of the image file to annotate
    file_name = os.path.abspath(image_path)

    # Loads the image into memory
    with io.open(file_name, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    # Performs label detection on the image file
    response = client.label_detection(image=image)
    labels = response.label_annotations

    # Creates a dictionary that has (description, score) as (key, value)
    generated_labels = dict()
    for label in labels:
        generated_labels[label.description] = round(label.score, 4)

    return generated_labels


def azure_api_call(image_path):
    """Calls Microsoft's Azure Vision API on the given image path

    Args:
        image_path (str): The path in storage to the image file

    Returns:
        str, dict: The generated description and the top 5 generated
                  labels from Google's API with (description, score) as (key, value)
    """
    analysis = None

    subscription_key = os.environ['COMPUTER_VISION_SUBSCRIPTION_KEY']
    endpoint = os.environ['COMPUTER_VISION_ENDPOINT']

    analyze_url = endpoint + "vision/v3.1/analyze"
    params = {'visualFeatures': 'Categories,Description,Color,Tags'}

    # Loads the image into memory
    with io.open(image_path, 'rb') as image_file:
        image_data = image_file.read()

    headers = {'Ocp-Apim-Subscription-Key': subscription_key,
               'Content-Type': 'application/octet-stream'}
    response = requests.post(
        analyze_url, headers=headers, params=params, data=image_data
    )
    response.raise_for_status()

    # The 'analysis' object contains various fields that describe the image. The most
    # relevant (=highest confidence) caption for the image is obtained
    # from the 'description' property.
    analysis = response.json()
    description = analysis['description']['captions'][0]

    generated_labels = dict()
    for label in analysis['tags']:
        generated_labels[label['name']] = round(label['confidence'], 4)

    # Get only the first 5 labels
    if len(generated_labels) > 5:
        generated_labels = dict(list(generated_labels.items())[:5])

    return description['text'], generated_labels
