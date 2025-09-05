from django.contrib import admin
from .models import AuditLog

# Register your models here.
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'type', 'timestamp')
    list_filter = ('type', 'timestamp')
    search_fields = ('action', 'user', 'type')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
