from rest_framework import serializers

from .models import DriveActivity, DriveFile, DriveFolder, DriveShare


class DriveFolderSerializer(serializers.ModelSerializer):
    """Serializer for the DriveFolder model"""

    subfolders_count = serializers.SerializerMethodField()
    files_count = serializers.SerializerMethodField()

    class Meta:
        model = DriveFolder
        fields = [
            "id",
            "startup",
            "name",
            "parent",
            "created_at",
            "created_by",
            "subfolders_count",
            "files_count",
            "path",
        ]
        read_only_fields = ["created_at", "path"]

    def get_subfolders_count(self, obj):
        """Get the number of subfolders"""
        return obj.subfolders.count()

    def get_files_count(self, obj):
        """Get the number of files in this folder"""
        return obj.files.count()


class DriveFolderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing folders"""

    class Meta:
        model = DriveFolder
        fields = ["id", "name", "parent", "created_at"]


class DriveFileSerializer(serializers.ModelSerializer):
    """Serializer for the DriveFile model"""

    download_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    human_size = serializers.SerializerMethodField()

    class Meta:
        model = DriveFile
        fields = [
            "id",
            "startup",
            "folder",
            "name",
            "file",
            "size",
            "human_size",
            "file_type",
            "uploaded_by",
            "uploaded_by_name",
            "uploaded_at",
            "last_modified",
            "description",
            "is_archived",
            "path",
            "download_url",
        ]
        read_only_fields = ["uploaded_at", "last_modified", "size", "human_size", "file_type", "path", "download_url"]

    def get_human_size(self, obj):
        """Get human-readable file size"""
        size = obj.size
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if size < 1024 or unit == "TB":
                return f"{size:.2f} {unit}"
            size /= 1024

    def get_uploaded_by_name(self, obj):
        """Get the name of the uploader"""
        if obj.uploaded_by:
            return obj.uploaded_by.name
        return None

    def get_download_url(self, obj):
        """Get the download URL for the file"""
        request = self.context.get("request")
        if request is None:
            return None
        return request.build_absolute_uri(f"/api/drive/files/{obj.id}/download/")


class DriveFileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing files"""

    human_size = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DriveFile
        fields = ["id", "name", "folder", "file_type", "human_size", "uploaded_at", "uploaded_by_name", "is_archived"]

    def get_human_size(self, obj):
        """Get human-readable file size"""
        size = obj.size
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if size < 1024 or unit == "TB":
                return f"{size:.2f} {unit}"
            size /= 1024

    def get_uploaded_by_name(self, obj):
        """Get the name of the uploader"""
        if obj.uploaded_by:
            return obj.uploaded_by.name
        return None


class DriveShareSerializer(serializers.ModelSerializer):
    """Serializer for the DriveShare model"""

    shared_item_name = serializers.SerializerMethodField()
    shared_item_type = serializers.SerializerMethodField()
    shared_by_name = serializers.SerializerMethodField()

    class Meta:
        model = DriveShare
        fields = [
            "id",
            "file",
            "folder",
            "shared_item_name",
            "shared_item_type",
            "shared_by",
            "shared_by_name",
            "shared_at",
            "access_token",
            "expires_at",
            "is_active",
            "is_expired",
        ]
        read_only_fields = [
            "shared_at",
            "access_token",
            "is_expired",
            "shared_item_name",
            "shared_item_type",
            "shared_by_name",
        ]

    def get_shared_item_name(self, obj):
        """Get the name of the shared item"""
        if obj.file:
            return obj.file.name
        if obj.folder:
            return obj.folder.name
        return None

    def get_shared_item_type(self, obj):
        """Get the type of the shared item"""
        if obj.file:
            return "file"
        if obj.folder:
            return "folder"
        return None

    def get_shared_by_name(self, obj):
        """Get the name of the user who shared the item"""
        if obj.shared_by:
            return obj.shared_by.name
        return None


class DriveActivitySerializer(serializers.ModelSerializer):
    """Serializer for the DriveActivity model"""

    user_name = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()

    class Meta:
        model = DriveActivity
        fields = [
            "id",
            "startup",
            "user",
            "user_name",
            "file",
            "folder",
            "item_name",
            "item_type",
            "action",
            "timestamp",
            "details",
        ]
        read_only_fields = [
            "startup",
            "user",
            "user_name",
            "file",
            "folder",
            "item_name",
            "item_type",
            "action",
            "timestamp",
            "details",
        ]

    def get_user_name(self, obj):
        """Get the name of the user"""
        if obj.user:
            return obj.user.name
        return None

    def get_item_name(self, obj):
        """Get the name of the item involved in the activity"""
        if obj.file:
            return obj.file.name
        if obj.folder:
            return obj.folder.name
        return None

    def get_item_type(self, obj):
        """Get the type of the item involved in the activity"""
        if obj.file:
            return "file"
        if obj.folder:
            return "folder"
        return None


class FileUploadSerializer(serializers.Serializer):
    """Serializer for file uploads"""

    file = serializers.FileField()
    folder = serializers.PrimaryKeyRelatedField(queryset=DriveFolder.objects.all(), required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_file(self, value):
        """Validate the file size and type"""
        # Example file size validation (limit to 50MB)
        if value.size > 50 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 50MB")
        return value
