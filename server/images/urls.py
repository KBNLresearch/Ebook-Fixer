from django.urls import path
from .views import image_classification_view


app_name = 'images'
urlpatterns = [
    path('classify/', image_classification_view, name='image-upload')
]
