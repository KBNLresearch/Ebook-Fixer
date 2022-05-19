from django.urls import path
from .views import image_details_view, image_classification_view


app_name = 'images'
urlpatterns = [
    path('get/', image_details_view, name='image-details'),
    path('classify/', image_classification_view, name='image-upload')
]
