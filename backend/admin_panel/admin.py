from django.contrib import admin

from .models import Event, Founder, Investor, News, NewsDetail, Partner, StartupDetail, StartupList, User


class NewsDetailAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "news_date", "category", "location"]
    fields = ["id", "title", "news_date", "category", "location", "startup_id", "description", "image"]
    readonly_fields = ["image"]


class NewsAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "news_date", "category", "location"]


class EventAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "dates", "location", "event_type"]
    fields = ["id", "name", "dates", "location", "description", "event_type", "target_audience", "image"]
    readonly_fields = ["image"]


class StartupListAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "legal_status", "sector", "maturity"]
    fields = ["id", "name", "legal_status", "address", "email", "phone", "sector", "maturity"]


class FounderInline(admin.TabularInline):
    model = Founder
    extra = 1
    fields = ["id", "name", "startup_id"]
    readonly_fields = ["id", "startup_id"]
    can_delete = False


class StartupDetailAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "legal_status", "sector", "maturity"]
    fields = [
        "id",
        "name",
        "legal_status",
        "address",
        "email",
        "phone",
        "created_at",
        "description",
        "website_url",
        "social_media_url",
        "project_status",
        "needs",
        "sector",
        "maturity",
        "founders_images",
    ]
    readonly_fields = ["founders_images"]
    filter_horizontal = ["founders"]


class FounderAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "startup_id"]
    fields = ["id", "name", "startup_id"]


class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "role"]
    fields = ["id", "name", "email", "role", "founder_id", "investor_id", "image"]
    readonly_fields = ["image"]
    search_fields = ["name", "email", "role"]
    list_filter = ["role"]


class InvestorAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "legal_status", "investor_type", "investment_focus"]
    fields = [
        "id",
        "name",
        "legal_status",
        "address",
        "email",
        "phone",
        "created_at",
        "description",
        "investor_type",
        "investment_focus",
    ]
    search_fields = ["name", "email", "investor_type", "investment_focus"]
    list_filter = ["investor_type", "legal_status"]


class PartnerAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "legal_status", "partnership_type"]
    fields = [
        "id",
        "name",
        "legal_status",
        "address",
        "email",
        "phone",
        "created_at",
        "description",
        "partnership_type",
    ]
    search_fields = ["name", "email", "partnership_type"]
    list_filter = ["partnership_type", "legal_status"]


admin.site.register(News, NewsAdmin)
admin.site.register(NewsDetail, NewsDetailAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(StartupList, StartupListAdmin)
admin.site.register(StartupDetail, StartupDetailAdmin)
admin.site.register(Founder, FounderAdmin)
admin.site.register(User, UserAdmin)
admin.site.register(Investor, InvestorAdmin)
admin.site.register(Partner, PartnerAdmin)
