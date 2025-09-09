from django.contrib import admin
from .models import DriveFolder, DriveFile, DriveShare, DriveActivity


@admin.register(DriveFolder)
class DriveFolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'startup', 'parent', 'created_at', 'created_by')
    list_filter = ('startup', 'created_at')
    search_fields = ('name', 'startup__name')
    date_hierarchy = 'created_at'
    raw_id_fields = ('startup', 'parent', 'created_by')


@admin.register(DriveFile)
class DriveFileAdmin(admin.ModelAdmin):
    list_display = ('name', 'startup', 'folder', 'file_type', 'size_display', 'uploaded_at', 'uploaded_by', 'is_archived')
    list_filter = ('startup', 'uploaded_at', 'file_type', 'is_archived')
    search_fields = ('name', 'startup__name', 'description')
    date_hierarchy = 'uploaded_at'
    raw_id_fields = ('startup', 'folder', 'uploaded_by')
    actions = ['archive_files', 'unarchive_files']

    def size_display(self, obj):
        """Display file size in human-readable format"""
        size = obj.size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024 or unit == 'TB':
                return f"{size:.2f} {unit}"
            size /= 1024

    size_display.short_description = 'Size'

    def archive_files(self, request, queryset):
        """Bulk action to archive files"""
        updated = queryset.update(is_archived=True)
        self.message_user(request, f"{updated} files have been archived.")

    archive_files.short_description = "Archive selected files"

    def unarchive_files(self, request, queryset):
        """Bulk action to unarchive files"""
        updated = queryset.update(is_archived=False)
        self.message_user(request, f"{updated} files have been unarchived.")

    unarchive_files.short_description = "Unarchive selected files"


@admin.register(DriveShare)
class DriveShareAdmin(admin.ModelAdmin):
    list_display = ('get_shared_item', 'shared_by', 'shared_at', 'expires_at', 'is_active', 'is_expired')
    list_filter = ('shared_at', 'is_active', 'expires_at')
    search_fields = ('file__name', 'folder__name', 'shared_by__email')
    date_hierarchy = 'shared_at'
    raw_id_fields = ('file', 'folder', 'shared_by')
    actions = ['activate_shares', 'deactivate_shares']

    def get_shared_item(self, obj):
        """Get the name of the shared item (file or folder)"""
        if obj.file:
            return f"File: {obj.file.name}"
        return f"Folder: {obj.folder.name}"

    get_shared_item.short_description = 'Shared Item'

    def is_expired(self, obj):
        """Check if the share has expired"""
        return obj.is_expired

    is_expired.boolean = True
    is_expired.short_description = 'Expired'

    def activate_shares(self, request, queryset):
        """Bulk action to activate shares"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f"{updated} shares have been activated.")

    activate_shares.short_description = "Activate selected shares"

    def deactivate_shares(self, request, queryset):
        """Bulk action to deactivate shares"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f"{updated} shares have been deactivated.")

    deactivate_shares.short_description = "Deactivate selected shares"


@admin.register(DriveActivity)
class DriveActivityAdmin(admin.ModelAdmin):
    list_display = ('action', 'startup', 'user', 'get_item', 'timestamp', 'ip_address')
    list_filter = ('action', 'startup', 'timestamp')
    search_fields = ('user__email', 'startup__name', 'file__name', 'folder__name')
    date_hierarchy = 'timestamp'
    readonly_fields = ('action', 'startup', 'user', 'file', 'folder', 'timestamp', 'details', 'ip_address')

    def get_item(self, obj):
        """Get the name of the item involved in the activity"""
        if obj.file:
            return f"File: {obj.file.name}"
        if obj.folder:
            return f"Folder: {obj.folder.name}"
        return "N/A"

    get_item.short_description = 'Item'

    def has_add_permission(self, request):
        """Disable adding activities manually"""
        return False

    def has_change_permission(self, request, obj=None):
        """Disable changing activities"""
        return False
