from django.urls import path
from .views import annotation_generation_view, annotation_save_view

app_name = 'annotations'
urlpatterns = [
    path('generate/', annotation_generation_view, name='annotation-generation'),
    path('save/', annotation_save_view, name='annotation-save')
]
