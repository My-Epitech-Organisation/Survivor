from rest_framework import serializers

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
            return f"/media/events/{obj.image}"
        return None
