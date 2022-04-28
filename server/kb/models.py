from django.db import models

# Create your models here.

class Student(models.Model):
    name = models.CharField(max_length=120)
    age = models.IntegerField()
    description = models.TextField()
    is_smart = models.BooleanField(default=False)

    def __str__(self):
        return self.name