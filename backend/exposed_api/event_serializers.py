from django.conf import settings
from rest_framework import serializers
import os

from admin_panel.models import Event


class EventSerializer(serializers.ModelSerializer):
    pictureURL = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "name",
            "dates",
            "location",
            "description",
            "event_type",
            "target_audience",
            "id",
            "pictureURL",
        ]

    def get_pictureURL(self, obj):
        if obj.image:
            return os.path.join(settings.MEDIA_URL.rstrip('/'), 'events', obj.image)
        return None
