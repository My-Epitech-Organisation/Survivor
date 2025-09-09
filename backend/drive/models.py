from django.db import models
from django.utils import timezone
from django.conf import settings

from admin_panel.models import StartupDetail


class DriveFolder(models.Model):
    """
    Represents a folder in the startup's drive system.
    Can be nested to create a folder hierarchy.
    """
    startup = models.ForeignKey(
        StartupDetail,
        on_delete=models.CASCADE,
        related_name='drive_folders',
        help_text="The startup this folder belongs to"
    )
    name = models.CharField(
        max_length=255,
        help_text="Name of the folder"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subfolders',
        help_text="Parent folder (null for root folders)"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the folder was created"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_folders',
        help_text="User who created the folder"
    )

    class Meta:
        unique_together = ('startup', 'parent', 'name')  # Prevent duplicate folder names within the same parent
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.startup.name})"

    @property
    def path(self):
        """Returns the full path of the folder"""
        if self.parent:
            return f"{self.parent.path}/{self.name}"
        return self.name

    def get_absolute_url(self):
        return f"/drive/folder/{self.id}/"


class DriveFile(models.Model):
    """
    Represents a file stored in the startup's drive system.
    """
    startup = models.ForeignKey(
        StartupDetail,
        on_delete=models.CASCADE,
        related_name='drive_files',
        help_text="The startup this file belongs to"
    )
    folder = models.ForeignKey(
        DriveFolder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='files',
        help_text="Folder containing this file (null for root files)"
    )
    name = models.CharField(
        max_length=255,
        help_text="Name of the file with extension"
    )
    file = models.FileField(
        upload_to='drive_files/%Y/%m/%d/',
        help_text="The actual file content"
    )
    size = models.PositiveBigIntegerField(
        help_text="Size of the file in bytes"
    )
    file_type = models.CharField(
        max_length=100,
        help_text="MIME type of the file"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_files',
        help_text="User who uploaded the file"
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the file was uploaded"
    )
    last_modified = models.DateTimeField(
        auto_now=True,
        help_text="When the file was last modified"
    )
    description = models.TextField(
        null=True,
        blank=True,
        help_text="Optional description of the file"
    )
    is_archived = models.BooleanField(
        default=False,
        help_text="Whether the file is archived (hidden but not deleted)"
    )

    class Meta:
        unique_together = ('startup', 'folder', 'name')  # Prevent duplicate file names within the same folder
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.name} ({self.startup.name})"

    @property
    def extension(self):
        """Returns the file extension"""
        return self.name.split('.')[-1] if '.' in self.name else ''

    @property
    def path(self):
        """Returns the full path of the file"""
        if self.folder:
            return f"{self.folder.path}/{self.name}"
        return self.name

    def get_absolute_url(self):
        return f"/drive/file/{self.id}/"


class DriveShare(models.Model):
    """
    Represents a file or folder share with limited access.
    Used for sharing with non-startup members.
    """
    file = models.ForeignKey(
        DriveFile,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='shares',
        help_text="The file being shared (null if sharing a folder)"
    )
    folder = models.ForeignKey(
        DriveFolder,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='shares',
        help_text="The folder being shared (null if sharing a file)"
    )
    shared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='drive_shares',
        help_text="User who created the share"
    )
    shared_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the share was created"
    )
    access_token = models.CharField(
        max_length=64,
        unique=True,
        help_text="Unique token for accessing the shared item"
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the share expires (null for no expiration)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the share is currently active"
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(file__isnull=False) | models.Q(folder__isnull=False),
                name='share_either_file_or_folder'
            ),
            models.CheckConstraint(
                check=~(models.Q(file__isnull=False) & models.Q(folder__isnull=False)),
                name='share_not_both_file_and_folder'
            )
        ]

    def __str__(self):
        if self.file:
            return f"Share of file: {self.file.name}"
        return f"Share of folder: {self.folder.name}"

    @property
    def is_expired(self):
        """Check if the share has expired"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    def get_absolute_url(self):
        return f"/share/{self.access_token}/"


class DriveActivity(models.Model):
    """
    Tracks activity in the drive system for auditing purposes.
    """
    ACTION_CHOICES = [
        ('upload', 'Upload'),
        ('download', 'Download'),
        ('rename', 'Rename'),
        ('move', 'Move'),
        ('delete', 'Delete'),
        ('restore', 'Restore'),
        ('share', 'Share'),
        ('unshare', 'Unshare'),
        ('create_folder', 'Create Folder'),
    ]

    startup = models.ForeignKey(
        StartupDetail,
        on_delete=models.CASCADE,
        related_name='drive_activities',
        help_text="The startup related to this activity"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='drive_activities',
        help_text="User who performed the action"
    )
    file = models.ForeignKey(
        DriveFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
        help_text="The file involved in the activity (if applicable)"
    )
    folder = models.ForeignKey(
        DriveFolder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
        help_text="The folder involved in the activity (if applicable)"
    )
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        help_text="The type of action performed"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When the action was performed"
    )
    details = models.JSONField(
        null=True,
        blank=True,
        help_text="Additional details about the action (JSON format)"
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the user who performed the action"
    )

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.get_action_display()} by {self.user} on {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
