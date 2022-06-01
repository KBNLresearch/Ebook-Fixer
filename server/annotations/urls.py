from .views import (
    annotation_save_view,
    azure_annotation_generation_view,
    google_annotation_generation_view
)

from django.urls import path


app_name = 'annotations'
urlpatterns = [
    path('generate/google/',
         google_annotation_generation_view, name='google-annotation-generation'),
    path('generate/azure/', azure_annotation_generation_view, name='azure-annotation-generation'),
    path('save/', annotation_save_view, name='annotation-save')
]
