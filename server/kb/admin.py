from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Ebook)
admin.site.register(Image)
admin.site.register(Annotation)
admin.site.register(ImageAnnotated)