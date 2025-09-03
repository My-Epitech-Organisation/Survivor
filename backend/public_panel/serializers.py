from rest_framework import serializers
from admin_panel.models import StartupDetail

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
