from rest_framework import serializers

from admin_panel.models import Investor


class InvestorCrudSerializer(serializers.ModelSerializer):
    """
    Serializer for Investor model CRUD operations.
    """

    class Meta:
        model = Investor
        fields = [
            "name",
            "legal_status",
            "address",
            "email",
            "phone",
            "created_at",
            "description",
            "investor_type",
            "investment_focus",
            "id",
        ]
