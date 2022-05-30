from django.urls import path
from .views import azure_annotation_generation_view
from .views import google_annotation_generation_view, annotation_save_view

app_name = 'annotations'
urlpatterns = [
    path('generate/google/',
         google_annotation_generation_view, name='google-annotation-generation'),
    path('generate/azure/', azure_annotation_generation_view, name='azure-annotation-generation'),
    path('save/', annotation_save_view, name='annotation-save')
]
