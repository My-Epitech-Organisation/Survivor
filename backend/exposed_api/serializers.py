from authentication.models import CustomUser
from django.conf import settings
from rest_framework import serializers

from admin_panel.models import Founder, StartupDetail

from .models import ProjectView


class FounderSerializer(serializers.ModelSerializer):
    """
    Serializer for Founder model in the project detail endpoint.
    For POST and PUT requests.
    """

    name = serializers.CharField(required=False)
    picture = serializers.CharField(required=False, allow_null=True)

    FounderName = serializers.CharField(required=False)
    FounderPictureURL = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Founder
        fields = ["name", "picture", "FounderName", "FounderPictureURL"]

    def is_valid(self, *args, **kwargs):
        if "FounderName" in self.initial_data and "name" not in self.initial_data:
            self.initial_data["name"] = self.initial_data["FounderName"]

        if "FounderPictureURL" in self.initial_data and "picture" not in self.initial_data:
            self.initial_data["picture"] = self.initial_data["FounderPictureURL"]

        is_valid = super().is_valid(*args, **kwargs)
        return is_valid

    def to_representation(self, instance):
        """
        Override to_representation to get the picture URL from founders_images
        """
        ret = super().to_representation(instance)

        startup_detail = instance.startups.first()
        if startup_detail and startup_detail.founders_images:
            founder_id = str(instance.id)
            if founder_id in startup_detail.founders_images:
                picture_path = startup_detail.founders_images[founder_id]
                if not picture_path.startswith("/"):
                    picture_url = f"/api/media/{picture_path}"
                else:
                    picture_url = picture_path

                ret["picture"] = picture_url

        return ret


class GetFounderSerializer(serializers.ModelSerializer):
    """
    Serializer for Founder model in the project detail GET endpoint.
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
                picture_path = startup_detail.founders_images[founder_id]
                if not picture_path.startswith("/"):
                    picture_url = f"/api/media/{picture_path}"
                else:
                    picture_url = picture_path

                return picture_url
        return None


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for the projects endpoint, mapping StartupDetail to the required format.
    Includes only essential project information for the GET /api/projects endpoint.
    """

    ProjectId = serializers.IntegerField(source="id", read_only=True)
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


class ProjectDetailGetSerializer(serializers.ModelSerializer):
    """
    Serializer for the project detail GET endpoint, providing detailed info about a specific project.
    """

    ProjectId = serializers.IntegerField(source="id", read_only=True)
    ProjectName = serializers.CharField(source="name")
    ProjectDescription = serializers.CharField(source="description", allow_null=True)
    ProjectSector = serializers.CharField(source="sector", allow_null=True)
    ProjectMaturity = serializers.CharField(source="maturity", allow_null=True)
    ProjectAddress = serializers.CharField(source="address", allow_null=True)
    ProjectLegalStatus = serializers.CharField(source="legal_status", allow_null=True)
    ProjectCreatedAt = serializers.CharField(source="created_at")
    ProjectFounders = GetFounderSerializer(source="founders", many=True, read_only=True)
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


class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the project detail endpoint for POST and PUT operations.
    """

    ProjectId = serializers.IntegerField(source="id", read_only=True)
    ProjectName = serializers.CharField(source="name")
    ProjectDescription = serializers.CharField(source="description", allow_null=True)
    ProjectSector = serializers.CharField(source="sector", allow_null=True)
    ProjectMaturity = serializers.CharField(source="maturity", allow_null=True)
    ProjectAddress = serializers.CharField(source="address", allow_null=True)
    ProjectLegalStatus = serializers.CharField(source="legal_status", allow_null=True)
    ProjectCreatedAt = serializers.CharField(source="created_at")
    ProjectFounders = FounderSerializer(source="founders", many=True)
    ProjectEmail = serializers.CharField(source="email")
    ProjectPhone = serializers.CharField(source="phone")
    ProjectNeeds = serializers.CharField(source="needs", allow_null=True)
    ProjectStatus = serializers.CharField(source="project_status", allow_null=True)
    ProjectSocial = serializers.CharField(source="social_media_url", allow_null=True)
    ProjectWebsite = serializers.CharField(source="website_url", allow_null=True)

    def is_valid(self, *args, **kwargs):
        is_valid = super().is_valid(*args, **kwargs)
        return is_valid

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

    def create(self, validated_data):
        request = self.context.get("request")
        raw_founders_data = []
        if request and hasattr(request, "data"):
            raw_founders_data = request.data.get("ProjectFounders", [])

        founders_data = validated_data.pop("founders", [])
        project = StartupDetail.objects.create(**validated_data)

        if founders_data:
            founders_images = {}

            founders_with_pics = {}
            if request and hasattr(request, "data"):
                for raw_founder in raw_founders_data:
                    if "name" in raw_founder and "picture" in raw_founder:
                        founders_with_pics[raw_founder["name"]] = raw_founder["picture"]

            for founder_data in founders_data:
                highest_founder_id = Founder.objects.all().order_by("-id").first()
                new_founder_id = 1 if highest_founder_id is None else highest_founder_id.id + 1

                founder = Founder.objects.create(id=new_founder_id, name=founder_data["name"], startup_id=project.id)

                picture = founders_with_pics.get(founder_data["name"])
                if picture:
                    if "/media/" in picture:
                        picture = picture.split("/media/")[1]
                    elif "/api/media/" in picture:
                        picture = picture.split("/api/media/")[1]

                    founders_images[str(founder.id)] = picture

                project.founders.add(founder)

            if founders_images:
                project.founders_images = founders_images
                project.save()

        return project

    def update(self, instance, validated_data):
        request = self.context.get("request")

        raw_founders_data = []
        if request and hasattr(request, "data"):
            raw_founders_data = request.data.get("ProjectFounders", [])

        founders_data = validated_data.pop("founders", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if founders_data is not None:
            existing_founders = {}
            for founder in instance.founders.all():
                existing_founders[founder.id] = {"name": founder.name, "id": founder.id}

            instance.founders.clear()

            founders_images = {}

            if raw_founders_data:
                founder_name_to_id = {}
                for founder_id, founder_info in existing_founders.items():
                    founder_name_to_id[founder_info["name"]] = founder_id

                for raw_founder in raw_founders_data:
                    founder_name = raw_founder.get("FounderName")
                    founder_id = raw_founder.get("FounderID")
                    picture_url = raw_founder.get("FounderPictureURL")

                    if not founder_name:
                        continue

                    reuse_id = None
                    if founder_id and founder_id in existing_founders:
                        reuse_id = founder_id
                    elif founder_name in founder_name_to_id:
                        reuse_id = founder_name_to_id[founder_name]

                    if not reuse_id:
                        highest_founder_id = Founder.objects.all().order_by("-id").first()
                        reuse_id = 1 if highest_founder_id is None else highest_founder_id.id + 1

                    try:
                        founder = Founder.objects.get(id=reuse_id)
                        founder.name = founder_name
                        founder.startup_id = instance.id
                        founder.save()
                    except Founder.DoesNotExist:
                        founder = Founder.objects.create(id=reuse_id, name=founder_name, startup_id=instance.id)

                    if picture_url:
                        if "/media/" in picture_url:
                            picture_url = picture_url.split("/media/")[1]
                        elif "/api/media/" in picture_url:
                            picture_url = picture_url.split("/api/media/")[1]

                        founders_images[str(founder.id)] = picture_url

                    instance.founders.add(founder)
            else:
                founder_name_to_id = {}
                for founder_id, founder_info in existing_founders.items():
                    founder_name_to_id[founder_info["name"]] = founder_id

                founders_with_pics = {}
                if request and hasattr(request, "data"):
                    for raw_founder in raw_founders_data:
                        if "name" in raw_founder and "picture" in raw_founder:
                            founders_with_pics[raw_founder["name"]] = raw_founder["picture"]

                for founder_data in founders_data:
                    if not founder_data:
                        continue

                    if "name" not in founder_data:
                        continue

                    founder_name = founder_data["name"]

                    reuse_id = None
                    if founder_name in founder_name_to_id:
                        reuse_id = founder_name_to_id[founder_name]

                    if not reuse_id:
                        highest_founder_id = Founder.objects.all().order_by("-id").first()
                        reuse_id = 1 if highest_founder_id is None else highest_founder_id.id + 1

                    try:
                        founder = Founder.objects.get(id=reuse_id)
                        founder.name = founder_name
                        founder.startup_id = instance.id
                        founder.save()
                    except Founder.DoesNotExist:
                        founder = Founder.objects.create(id=reuse_id, name=founder_name, startup_id=instance.id)

                    picture = founders_with_pics.get(founder_name)
                    if picture:
                        if "/media/" in picture:
                            picture = picture.split("/media/")[1]
                        elif "/api/media/" in picture:
                            picture = picture.split("/api/media/")[1]

                        founders_images[str(founder.id)] = picture

                    instance.founders.add(founder)

            if founders_images:
                instance.founders_images = founders_images

        instance.save()
        return instance


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
        fields = ["name", "pictureURL", "nbStartups", "email", "investorId", "founderId", "id"]

    def get_pictureURL(self, obj):
        if obj.image:
            image_path = obj.image
            if image_path.startswith('/'):
                image_path = image_path[1:]
            return f"{settings.MEDIA_URL.rstrip('/')}/{image_path}"
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


class ProjectViewSerializer(serializers.ModelSerializer):
    """
    Serializer for the ProjectView model.
    """

    project_name = serializers.CharField(source="project.name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = ProjectView
        fields = ["id", "project", "project_name", "timestamp", "user", "user_email", "ip_address", "session_key"]
        read_only_fields = ["timestamp"]


class ProjectViewStatsSerializer(serializers.Serializer):
    """
    Serializer for project view statistics.
    """

    total_views = serializers.IntegerField()
    unique_users = serializers.IntegerField()
    unique_ips = serializers.IntegerField()
    unique_sessions = serializers.IntegerField()
    period_start = serializers.DateTimeField(required=False)
    period_end = serializers.DateTimeField(required=False)
