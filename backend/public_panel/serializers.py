from rest_framework import serializers
from admin_panel.models import StartupDetail, Founder
from django.conf import settings

class FounderSerializer(serializers.ModelSerializer):
    """
    Serializer for Founder model in the project detail endpoint.
    """
    FounderID = serializers.IntegerField(source='id')
    FounderName = serializers.CharField(source='name')
    FounderStartupID = serializers.IntegerField(source='startup_id')
    FounderPictureURL = serializers.SerializerMethodField()

    class Meta:
        model = Founder
        fields = [
            'FounderID',
            'FounderName',
            'FounderStartupID',
            'FounderPictureURL'
        ]

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
    ProjectId = serializers.IntegerField(source='id')
    ProjectName = serializers.CharField(source='name')
    ProjectDescription = serializers.CharField(source='description', allow_null=True)
    ProjectSector = serializers.CharField(source='sector')
    ProjectMaturity = serializers.CharField(source='maturity')
    ProjectLocation = serializers.CharField(source='address')
    ProjectNeeds = serializers.CharField(source='needs', allow_null=True)
    ProjectStatus = serializers.CharField(source='project_status', allow_null=True)

    class Meta:
        model = StartupDetail
        fields = [
            'ProjectId',
            'ProjectName',
            'ProjectDescription',
            'ProjectSector',
            'ProjectMaturity',
            'ProjectLocation',
            'ProjectNeeds',
            'ProjectStatus'
        ]

class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the project detail endpoint, providing detailed info about a specific project.
    """
    ProjectId = serializers.IntegerField(source='id')
    ProjectName = serializers.CharField(source='name')
    ProjectDescription = serializers.CharField(source='description', allow_null=True)
    ProjectSector = serializers.CharField(source='sector', allow_null=True)
    ProjectMaturity = serializers.CharField(source='maturity', allow_null=True)
    ProjectAddress = serializers.CharField(source='address', allow_null=True)
    ProjectLegalStatus = serializers.CharField(source='legal_status', allow_null=True)
    ProjectCreatedAt = serializers.CharField(source='created_at')
    ProjectFounders = FounderSerializer(source='founders', many=True, read_only=True)
    ProjectEmail = serializers.CharField(source='email')
    ProjectPhone = serializers.CharField(source='phone')
    ProjectNeeds = serializers.CharField(source='needs', allow_null=True)
    ProjectStatus = serializers.CharField(source='project_status', allow_null=True)
    ProjectSocial = serializers.CharField(source='social_media_url', allow_null=True)
    ProjectWebsite = serializers.CharField(source='website_url', allow_null=True)

    class Meta:
        model = StartupDetail
        fields = [
            'ProjectId',
            'ProjectName',
            'ProjectDescription',
            'ProjectSector',
            'ProjectMaturity',
            'ProjectAddress',
            'ProjectLegalStatus',
            'ProjectCreatedAt',
            'ProjectFounders',
            'ProjectEmail',
            'ProjectPhone',
            'ProjectNeeds',
            'ProjectStatus',
            'ProjectSocial',
            'ProjectWebsite'
        ]
