from .views import image_classification_view, image_details_view, image_get_all_view

from django.urls import path


app_name = 'images'
urlpatterns = [
    path('get/', image_details_view, name='image-details'),
    path('classify/', image_classification_view, name='image-upload'),
    path('getAll/', image_get_all_view, name='image-get-all')
]
