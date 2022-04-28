from django.db import models

# Create your models here.
class Ebook(models.Model):
    title = models.CharField(max_length=50)
    epub3_path = models.CharField(max_length=50)


# class Image(models.Model):
#     ebook = models.ForeignKey()

# class Annotation(models.Model):
#     image = models.ForeignKey()
