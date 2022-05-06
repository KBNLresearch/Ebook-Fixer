"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from ebooks.views import EbookView
from images.views import ImageView
from annotations.views import AnnotationView
from django.conf import settings
from django.conf.urls.static import static

router = routers.DefaultRouter()
router.register(r'ebooks', EbookView, 'ebook')
router.register(r'images', ImageView, 'image')
router.register(r'annotations', AnnotationView, 'annotation')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

# Allows localhost:8000 to serve the uploaded epub files
# For example at:
# "http://localhost:8000/test-ebooks/f8825e97-c336-4138-85d7-28aa691defc6/pg84.epub"
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
