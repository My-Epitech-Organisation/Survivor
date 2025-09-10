from django.contrib import admin

from .models import ProjectDislike, ProjectLike, ProjectShare, ProjectView, SiteStatistics


@admin.register(SiteStatistics)
class SiteStatisticsAdmin(admin.ModelAdmin):
    list_display = ["date", "new_signups"]
    list_filter = ["date"]
    date_hierarchy = "date"


@admin.register(ProjectView)
class ProjectViewAdmin(admin.ModelAdmin):
    list_display = ["project", "timestamp", "user", "ip_address", "session_key"]
    list_filter = ["timestamp", "project"]
    search_fields = ["project__name", "user__email", "ip_address"]
    date_hierarchy = "timestamp"
    readonly_fields = ["timestamp"]

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ProjectLike)
class ProjectLikeAdmin(admin.ModelAdmin):
    list_display = ["project", "timestamp", "user", "ip_address", "session_key"]
    list_filter = ["timestamp", "project"]
    search_fields = ["project__name", "user__email", "ip_address"]
    date_hierarchy = "timestamp"
    readonly_fields = ["timestamp"]

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ProjectDislike)
class ProjectDislikeAdmin(admin.ModelAdmin):
    list_display = ["project", "timestamp", "user", "ip_address", "session_key"]
    list_filter = ["timestamp", "project"]
    search_fields = ["project__name", "user__email", "ip_address"]
    date_hierarchy = "timestamp"
    readonly_fields = ["timestamp"]

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ProjectShare)
class ProjectShareAdmin(admin.ModelAdmin):
    list_display = ["project", "timestamp", "user", "ip_address", "session_key", "platform"]
    list_filter = ["timestamp", "project", "platform"]
    search_fields = ["project__name", "user__email", "ip_address", "platform"]
    date_hierarchy = "timestamp"
    readonly_fields = ["timestamp"]

    def has_change_permission(self, request, obj=None):
        return False
