from .models import Ebook

from rest_framework import serializers


class EbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ebook
        fields = ('uuid', 'title', 'state', 'checker_issues')
