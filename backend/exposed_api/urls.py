from django.urls import path

from . import project_views, user_views, views
from .event_views import EventListView
from .news_views import NewsListView, NewsDetailView

app_name = "exposed_api"


urlpatterns = [
    # Project endpoints
    path("projects/", project_views.ProjectDetailView.as_view(), name="project_create_or_list"),
    path("projects/<int:_id>/", project_views.ProjectDetailView.as_view(), name="project_detail_or_crud"),
    # Events endpoint
    path("events/", EventListView.as_view(), name="events_list"),
    # News endpoints
    path("news/", NewsListView.as_view(), name="news_list"),
    path("news/<int:news_id>/", NewsDetailView.as_view(), name="news_detail"),
    # User endpoints
    path("user/", user_views.get_current_user, name="current_user"),
    path("user/<int:user_id>/", user_views.user_detail, name="user_detail"),
    # Other endpoints
    path("projectViews/<int:user_id>/", views.project_views, name="project_views"),
    path("projectEngagement/<int:user_id>/", views.project_engagement, name="project_engagement"),
]
