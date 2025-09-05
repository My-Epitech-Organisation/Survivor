from django.contrib import admin

from .models import Message, ReadReceipt, Thread, TypingIndicator


@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "last_message_at")
    filter_horizontal = ("participants",)
    search_fields = ("participants__email",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "thread", "created_at")
    list_filter = ("created_at",)
    search_fields = ("body", "sender__email")


@admin.register(ReadReceipt)
class ReadReceiptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "thread", "last_read_message", "read_at")
    list_filter = ("read_at",)
    search_fields = ("user__email",)


@admin.register(TypingIndicator)
class TypingIndicatorAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "thread", "started_at", "is_typing")
    list_filter = ("is_typing", "started_at")
    search_fields = ("user__email",)
