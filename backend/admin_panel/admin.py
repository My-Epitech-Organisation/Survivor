from django.contrib import admin
from .models import News, NewsDetail


class NewsDetailAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'news_date', 'category', 'location']
    fields = ['id', 'title', 'news_date', 'category', 'location', 'startup_id', 'description', 'image']
    readonly_fields = ['image']

class NewsAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'news_date', 'category', 'location']

admin.site.register(News, NewsAdmin)
admin.site.register(NewsDetail, NewsDetailAdmin)
