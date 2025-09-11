from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import DriveActivity

# Note: This file contains actions to be added to the DriveFileViewSet class


def preview_file_action(self, request, pk=None):
    """
    Preview a text file's content.
    """
    from .text_serializers import TextFileContentSerializer

    file_obj = self.get_object()

    # Check if file is a text file
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


def update_file_content_action(self, request, pk=None):
    """
    Update the content of a text file.
    """
    from .text_serializers import TextFileUpdateSerializer

    file_obj = self.get_object()

    # Check if file is a text file
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

            # Save the new content to the file
            file_obj.file.save(file_obj.name, ContentFile(content.encode("utf-8")), save=False)

            # Update file size
            file_obj.size = file_obj.file.size
            file_obj.save()

            # Log edit activity
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


# Add these methods to DriveFileViewSet:
"""
# In DriveFileViewSet class:

@action(detail=True, methods=["get"])
def preview(self, request, pk=None):
    return preview_file_action(self, request, pk)

@action(detail=True, methods=["put"])
def update_content(self, request, pk=None):
    return update_file_content_action(self, request, pk)
"""
