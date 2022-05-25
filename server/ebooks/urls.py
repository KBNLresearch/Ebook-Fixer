from django.urls import path
from .views import ebook_download_view, ebook_upload_view


app_name = 'ebooks'
urlpatterns = [
    path('upload/', ebook_upload_view, name='ebook-upload'),
    path('download/<str:uuid>/', ebook_download_view, name='ebook-download')
]
