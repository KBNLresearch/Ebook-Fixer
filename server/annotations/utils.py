import io
import json
import os
import requests
import yake

from ebooks.models import Ebook
from images.models import Image

from bs4 import BeautifulSoup
from django.http import JsonResponse
from google.cloud import vision
from json import JSONDecodeError
from rest_framework import status


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


def google_vision_labels(image_path):
    """ Calls Google Vision API on the given image path.

    Args:
        image_path (str): The path in storage to the image file

    Returns:
        dict: The labels from Google's API with (description, score) as (key, value)
    """
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
    """ Calls Microsoft's Azure Vision API on the given image path.

    Args:
        image_path (str): The path in storage to the image file

    Returns:
        str, dict: The generated description and the top 10 generated
                  labels from Azures's API with (description, score) as (key, value)
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

    # The 'analysis' object contains various fields that describe the image.
    # The most relevant (=highest confidence) caption for the image is obtained from the 'description' property. # noqa: E501
    analysis = response.json()
    description = analysis['description']['captions'][0]

    generated_labels = dict()
    for label in analysis['tags']:
        generated_labels[label['name']] = round(label['confidence'], 4)

    # Get only the first 10 labels
    if len(generated_labels) > 10:
        generated_labels = dict(list(generated_labels.items())[:10])

    return description['text'], generated_labels


def yake_labels(image):
    """ Performs keyword extraction on the textual context of the image.

    Args:
        image (Image): the image for which we want to extract the keywords

    Returns:
        dict: The keyword and the confidence with (description, score) as (key, value)
    """
    context = extract_context(image)
    kw_extractor = yake.KeywordExtractor(top=10, stopwords=None)
    keywords = kw_extractor.extract_keywords(context)
    generated_labels = dict()
    for kw, v in keywords:
        generated_labels[kw] = round(1 - v, 4)

    return generated_labels


def extract_context(image):
    """ Extracts the text, surrounding an image, from the html file, in which it can be found.

    Args:
        image (Image): the image for which we want to extract the textual context

    Returns:
        String: The text surrounding the image
    """
    html_file = f"test-books/{image.ebook}{image.location}"
    with open(html_file, 'r') as file:
        soup = BeautifulSoup(file, 'html.parser')
        html_image = filter(lambda im: im['src'].endswith(os.path.basename(image.filename)),
                            soup.find_all('img')
                            ).__next__()
        surrounding_elements = html_image.find_all_previous(name='p', limit=2) + \
            html_image.find_all_previous(name='div', limit=2) + \
            html_image.find_all_next(name='p', limit=2) + \
            html_image.find_all_next(name='div', limit=2)
        surrounding_elements = list(map(lambda e: e.text, surrounding_elements))

    context = ''
    for element in surrounding_elements:
        context += element.rstrip('\n')

    return context
