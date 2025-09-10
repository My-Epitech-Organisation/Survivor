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
        # Add any validation for file content here
        if len(data['content'].encode('utf-8')) > 10 * 1024 * 1024:  # 10 MB limit
            raise serializers.ValidationError("File content exceeds maximum size of 10 MB")
        return data
