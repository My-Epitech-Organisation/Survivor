"""
Search serializers for the Survivor project.
These serializers handle the normalization and representation of search results.
"""

from rest_framework import serializers

from admin_panel.models import Event, Founder, NewsDetail, StartupDetail


class FounderSearchSerializer(serializers.ModelSerializer):
    """Serializer for founder data in search results."""

    class Meta:
        model = Founder
        fields = ["id", "name"]


class StartupSearchResultSerializer(serializers.ModelSerializer):
    """Serializer for startup/project search results."""

    founders = FounderSearchSerializer(many=True, read_only=True)
    result_type = serializers.SerializerMethodField()

    class Meta:
        model = StartupDetail
        fields = [
            "id",
            "name",
            "description",
            "sector",
            "maturity",
            "address",
            "website_url",
            "project_status",
            "founders",
            "result_type",
        ]

    def get_result_type(self, obj):
        """Return the type of result."""
        return "project"


class EventSearchResultSerializer(serializers.ModelSerializer):
    """Serializer for event search results."""

    result_type = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ["id", "name", "description", "event_type", "location", "dates", "result_type"]

    def get_result_type(self, obj):
        """Return the type of result."""
        return "event"


class NewsSearchResultSerializer(serializers.ModelSerializer):
    """Serializer for news search results."""

    result_type = serializers.SerializerMethodField()

    class Meta:
        model = NewsDetail
        fields = ["id", "title", "description", "category", "location", "news_date", "result_type"]

    def get_result_type(self, obj):
        """Return the type of result."""
        return "news"


class SearchResultSerializer(serializers.Serializer):
    """
    Main serializer for normalized search results.

    This serializer provides a consistent structure for different result types
    to ensure a uniform API response regardless of the entity type.
    """

    id = serializers.IntegerField()
    title = serializers.SerializerMethodField()
    description = serializers.CharField(allow_blank=True, allow_null=True)
    type = serializers.CharField()
    score = serializers.FloatField()
    entity = serializers.JSONField()

    def get_title(self, obj):
        """Extract the appropriate title from the normalized result dict."""
        try:
            return obj.get("title") or obj.get("name") or "Untitled"
        except Exception:
            if hasattr(obj, "title"):
                return obj.title
            if hasattr(obj, "name"):
                return obj.name
            return "Untitled"
