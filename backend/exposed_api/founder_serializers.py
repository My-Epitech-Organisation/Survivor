from rest_framework import serializers

from admin_panel.models import Founder


class FounderCrudSerializer(serializers.ModelSerializer):
    """
    Serializer for Founder model CRUD operations.
    """

    class Meta:
        model = Founder
        fields = ["name", "id", "startup_id"]
