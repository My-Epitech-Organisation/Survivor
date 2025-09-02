from django.contrib import admin
from .models import News, NewsDetail
from .models import Event


class NewsDetailAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'news_date', 'category', 'location']
    fields = ['id', 'title', 'news_date', 'category', 'location', 'startup_id', 'description', 'image']
    readonly_fields = ['image']

class NewsAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'news_date', 'category', 'location']

class EventAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'dates', 'location', 'event_type']
    fields = ['id', 'name', 'dates', 'location', 'description', 'event_type', 'target_audience', 'image']
    readonly_fields = ['image']

admin.site.register(News, NewsAdmin)
admin.site.register(NewsDetail, NewsDetailAdmin)
admin.site.register(Event, EventAdmin)
