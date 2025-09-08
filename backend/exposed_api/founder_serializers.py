from rest_framework import serializers

from admin_panel.models import Founder, StartupDetail


class FounderCrudSerializer(serializers.ModelSerializer):
    """
    Serializer for Founder model CRUD operations.
    """

    class Meta:
        model = Founder
        fields = ["name", "id", "startup_id"]


class FounderDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Founder model with formatted field names and additional fields.
    """
    FounderID = serializers.IntegerField(source='id')
    FounderName = serializers.CharField(source='name')
    FounderStartupID = serializers.IntegerField(source='startup_id')
    FounderPictureURL = serializers.SerializerMethodField()

    class Meta:
        model = Founder
        fields = ['FounderID', 'FounderName', 'FounderStartupID', 'FounderPictureURL']

    def get_FounderPictureURL(self, obj):
        """
        Get the founder's picture URL from the associated startup's founders_images field.
        Returns None if no image is found.
        """
        try:
            startup = StartupDetail.objects.get(id=obj.startup_id)
            if startup.founders_images and isinstance(startup.founders_images, dict):
                return startup.founders_images.get(str(obj.id))
            return None
        except StartupDetail.DoesNotExist:
            return None
