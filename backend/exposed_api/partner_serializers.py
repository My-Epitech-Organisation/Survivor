from rest_framework import serializers

from admin_panel.models import Partner


class PartnerCrudSerializer(serializers.ModelSerializer):
    """
    Serializer for Partner model CRUD operations.
    """

    class Meta:
        model = Partner
        fields = [
            "name",
            "legal_status",
            "address",
            "email",
            "phone",
            "created_at",
            "description",
            "partnership_type",
            "id",
        ]
