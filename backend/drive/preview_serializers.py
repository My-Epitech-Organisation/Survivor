from django.conf import settings
from rest_framework import serializers

class TextFileContentSerializer(serializers.Serializer):
    """Serializer for text file content"""
    content = serializers.CharField(allow_blank=True)

class TextFileUpdateSerializer(serializers.Serializer):
    """Serializer for updating text file content"""
    content = serializers.CharField(allow_blank=True)
    
    def validate(self, data):
        """Validate that the content is valid"""
        if len(data['content'].encode('utf-8')) > 10 * 1024 * 1024:  # 10 MB limit
            raise serializers.ValidationError("File content exceeds maximum size of 10 MB")
        return data

class ImageFilePreviewSerializer(serializers.Serializer):
    """Serializer for image file preview"""
    image_url = serializers.URLField()
    file_type = serializers.CharField()
    width = serializers.IntegerField(required=False, allow_null=True)
    height = serializers.IntegerField(required=False, allow_null=True)
