from django.conf import settings
from rest_framework import serializers
from admin_panel.models import StartupDetail, Founder
from authentication.models import CustomUser

class FounderSerializer(serializers.ModelSerializer):
    """
    Serializer for Founder model in the project detail endpoint.
    """

    FounderID = serializers.IntegerField(source="id")
    FounderName = serializers.CharField(source="name")
    FounderStartupID = serializers.IntegerField(source="startup_id")
    FounderPictureURL = serializers.SerializerMethodField()

    class Meta:
        model = Founder
        fields = ["FounderID", "FounderName", "FounderStartupID", "FounderPictureURL"]

    def get_FounderPictureURL(self, obj):
        startup_detail = obj.startups.first()
        if startup_detail and startup_detail.founders_images:
            founder_id = str(obj.id)
            if founder_id in startup_detail.founders_images:
                return f"{settings.MEDIA_URL}{startup_detail.founders_images[founder_id]}"
        return None


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for the projects endpoint, mapping StartupDetail to the required format.
    """

    ProjectId = serializers.IntegerField(source="id")
    ProjectName = serializers.CharField(source="name")
    ProjectDescription = serializers.CharField(source="description", allow_null=True)
    ProjectSector = serializers.CharField(source="sector")
    ProjectMaturity = serializers.CharField(source="maturity")
    ProjectLocation = serializers.SerializerMethodField()
    ProjectNeeds = serializers.CharField(source="needs", allow_null=True)
    ProjectStatus = serializers.CharField(source="project_status", allow_null=True)

    class Meta:
        model = StartupDetail
        fields = [
            "ProjectId",
            "ProjectName",
            "ProjectDescription",
            "ProjectSector",
            "ProjectMaturity",
            "ProjectLocation",
            "ProjectNeeds",
            "ProjectStatus",
        ]

    def get_ProjectLocation(self, obj):
        """
        Extract only the country name from the address field.
        Expected format: '4 Startup Blvd., 49535 Finland' -> 'Finland'
        """
        if obj.address:
            parts = obj.address.split(",")
            if parts:
                last_part = parts[-1].strip()
                country = last_part.split()[-1] if last_part.split() else ""
                return country
        return None


class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the project detail endpoint, providing detailed info about a specific project.
    """

    ProjectId = serializers.IntegerField(source="id")
    ProjectName = serializers.CharField(source="name")
    ProjectDescription = serializers.CharField(source="description", allow_null=True)
    ProjectSector = serializers.CharField(source="sector", allow_null=True)
    ProjectMaturity = serializers.CharField(source="maturity", allow_null=True)
    ProjectAddress = serializers.CharField(source="address", allow_null=True)
    ProjectLegalStatus = serializers.CharField(source="legal_status", allow_null=True)
    ProjectCreatedAt = serializers.CharField(source="created_at")
    ProjectFounders = FounderSerializer(source="founders", many=True, read_only=True)
    ProjectEmail = serializers.CharField(source="email")
    ProjectPhone = serializers.CharField(source="phone")
    ProjectNeeds = serializers.CharField(source="needs", allow_null=True)
    ProjectStatus = serializers.CharField(source="project_status", allow_null=True)
    ProjectSocial = serializers.CharField(source="social_media_url", allow_null=True)
    ProjectWebsite = serializers.CharField(source="website_url", allow_null=True)

    class Meta:
        model = StartupDetail
        fields = [
            "ProjectId",
            "ProjectName",
            "ProjectDescription",
            "ProjectSector",
            "ProjectMaturity",
            "ProjectAddress",
            "ProjectLegalStatus",
            "ProjectCreatedAt",
            "ProjectFounders",
            "ProjectEmail",
            "ProjectPhone",
            "ProjectNeeds",
            "ProjectStatus",
            "ProjectSocial",
            "ProjectWebsite",
        ]


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the user endpoint.
    """

    name = serializers.CharField()
    pictureURL = serializers.SerializerMethodField()
    nbStartups = serializers.SerializerMethodField()
    email = serializers.CharField()
    investorId = serializers.IntegerField(source="investor_id", allow_null=True)
    founderId = serializers.IntegerField(source="founder_id", allow_null=True)
    id = serializers.IntegerField()

    class Meta:
        model = CustomUser
        fields = ['name', 'pictureURL', 'nbStartups', 'email', 'investorId', 'founderId', 'id']

    def get_pictureURL(self, obj):
        if obj.image:
            return f"{settings.MEDIA_URL}{obj.image}"
        return None

    def get_nbStartups(self, obj):
        if obj.founder_id:
            try:
                founder = Founder.objects.get(id=obj.founder_id)
                return founder.startups.count()
            except Founder.DoesNotExist:
                pass
        return 0


class ProjectViewsSerializer(serializers.Serializer):
    """
    Serializer for the project views endpoint.
    """

    month = serializers.CharField()
    views = serializers.IntegerField()


class ProjectEngagementSerializer(serializers.Serializer):
    """
    Serializer for the project engagement endpoint.
    """

    rate = serializers.IntegerField()
