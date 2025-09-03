from authentication.models import CustomUser
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Event, Founder, News, NewsDetail, Partner, StartupDetail, StartupList

DjangoUser = get_user_model()


class DjangoUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = DjangoUser
        fields = ["id", "email", "name", "is_staff", "is_active", "date_joined"]
        read_only_fields = ["date_joined"]


class CustomUserSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "email", "name", "role", "founder_id", "investor_id", "image_url"]

    def get_image_url(self, obj):
        if obj.image:
            from django.conf import settings

            return f"{settings.MEDIA_URL}{obj.image}"
        return None


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = "__all__"


class NewsDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsDetail
        fields = ["id", "title", "news_date", "location", "category", "startup_id", "description", "image_url"]

    def get_image_url(self, obj):
        if obj.image:
            from django.conf import settings

            return f"{settings.MEDIA_URL}{obj.image}"
        return None


class EventSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ["id", "name", "dates", "location", "description", "event_type", "target_audience", "image_url"]

    def get_image_url(self, obj):
        if obj.image:
            from django.conf import settings

            return f"{settings.MEDIA_URL}{obj.image}"
        return None


class StartupListSerializer(serializers.ModelSerializer):
    class Meta:
        model = StartupList
        fields = "__all__"


class FounderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Founder
        fields = "__all__"


class StartupDetailSerializer(serializers.ModelSerializer):
    founders = FounderSerializer(many=True, read_only=True)
    founders_images_urls = serializers.SerializerMethodField()

    class Meta:
        model = StartupDetail
        fields = [
            "id",
            "name",
            "legal_status",
            "address",
            "email",
            "phone",
            "created_at",
            "description",
            "website_url",
            "social_media_url",
            "project_status",
            "needs",
            "sector",
            "maturity",
            "founders",
            "founders_images_urls",
        ]

    def get_founders_images_urls(self, obj):
        if obj.founders_images:
            from django.conf import settings

            urls = {}
            for founder_id, image_path in obj.founders_images.items():
                urls[founder_id] = f"{settings.MEDIA_URL}{image_path}"
            return urls
        return None


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"
