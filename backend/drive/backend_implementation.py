from django.core.files.base import ContentFile
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DriveActivity


class TextFileContentSerializer(serializers.Serializer):
    """Serializer for text file content"""

    content = serializers.CharField(allow_blank=True)


class TextFileUpdateSerializer(serializers.Serializer):
    """Serializer for updating text file content"""

    content = serializers.CharField(allow_blank=True)

    def validate(self, data):
        """Validate that the content is valid"""
        if len(data["content"].encode("utf-8")) > 10 * 1024 * 1024:  # 10 MB limit
            raise serializers.ValidationError("File content exceeds maximum size of 10 MB")
        return data


@action(detail=True, methods=["get"])
def preview(self, request, pk=None):
    """
    Preview a text file's content.
    """
    file_obj = self.get_object()

    text_mime_types = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/json",
        "text/markdown",
        "text/csv",
        "text/xml",
        "application/xml",
        "text/x-python",
        "text/x-typescript",
        "text/x-javascript",
    ]

    if file_obj.file_type not in text_mime_types:
        return Response({"error": "This file type is not supported for preview"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        content = file_obj.file.read().decode("utf-8")

        # Log preview activity
        DriveActivity.objects.create(
            startup=file_obj.startup,
            user=request.user,
            file=file_obj,
            action="preview",
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        serializer = TextFileContentSerializer({"content": content})
        return Response(serializer.data)
    except UnicodeDecodeError:
        return Response(
            {"error": "This file uses an encoding that is not supported for preview"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@action(detail=True, methods=["put"])
def update_content(self, request, pk=None):
    """
    Update the content of a text file.
    """
    file_obj = self.get_object()

    text_mime_types = [
        "text/plain",
        "text/html",
        "text/css",
        "text/javascript",
        "application/json",
        "text/markdown",
        "text/csv",
        "text/xml",
        "application/xml",
        "text/x-python",
        "text/x-typescript",
        "text/x-javascript",
    ]

    if file_obj.file_type not in text_mime_types:
        return Response({"error": "This file type is not supported for editing"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = TextFileUpdateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            content = serializer.validated_data["content"]

            file_obj.file.save(file_obj.name, ContentFile(content.encode("utf-8")), save=False)

            file_obj.size = file_obj.file.size
            file_obj.save()

            DriveActivity.objects.create(
                startup=file_obj.startup,
                user=request.user,
                file=file_obj,
                action="edit",
                details={"old_size": file_obj.size, "new_size": file_obj.file.size},
                ip_address=request.META.get("REMOTE_ADDR"),
            )

            return Response({"status": "File content updated successfully"})
        except Exception as e:
            return Response(
                {"error": f"Failed to update file content: {e!s}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
