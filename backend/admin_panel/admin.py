from authentication.models import CustomUser
from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import Event, Founder, Investor, NewsDetail, Partner, StartupDetail


class NewsDetailAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "news_date", "category", "location"]
    fields = ["id", "title", "news_date", "category", "location", "startup_id", "description", "image"]
    readonly_fields = ["image"]


class EventAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "dates", "location", "event_type"]
    fields = ["id", "name", "dates", "location", "description", "event_type", "target_audience", "image"]
    readonly_fields = ["image"]


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
        "founders",
        "display_founders_images",
    ]
    readonly_fields = ["display_founders_images"]
    filter_horizontal = ["founders"]

    def display_founders_images(self, obj):
        """
        Display founders' images as HTML img tags
        """
        if not obj.founders_images:
            return "No images available"

        html = ""
        for founder_id, image_path in obj.founders_images.items():
            if image_path:
                html += f'<img src="/media/{image_path}" width="150" height="150" style="margin: 10px;" />'
                try:
                    founder = Founder.objects.get(id=int(founder_id))
                    html += f"<p>{founder.name}</p>"
                except (Founder.DoesNotExist, ValueError):
                    html += f"<p>Founder ID: {founder_id}</p>"

        return mark_safe(html) if html else "No images available"

    display_founders_images.short_description = "Founders Images"


class FounderAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "startup_id", "display_image"]
    fields = ["id", "name", "startup_id", "display_image"]
    readonly_fields = ["display_image"]

    def display_image(self, obj):
        """
        Display founder's image if available
        """
        # Get all startups associated with this founder
        startups = obj.startups.all()

        for startup in startups:
            if startup.founders_images and str(obj.id) in startup.founders_images:
                image_path = startup.founders_images.get(str(obj.id))
                if image_path:
                    return mark_safe(f'<img src="/media/{image_path}" width="150" height="150" />')

        return "No image available"

    display_image.short_description = "Founder Image"


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "role", "is_staff", "is_active"]
    fields = ["name", "email", "role", "founder_id", "investor_id", "image", "is_staff", "is_active", "date_joined"]
    readonly_fields = ["image", "date_joined"]
    search_fields = ["name", "email", "role"]
    list_filter = ["role", "is_staff", "is_active"]


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


admin.site.register(NewsDetail, NewsDetailAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(StartupDetail, StartupDetailAdmin)
admin.site.register(Founder, FounderAdmin)
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Investor, InvestorAdmin)
admin.site.register(Partner, PartnerAdmin)
