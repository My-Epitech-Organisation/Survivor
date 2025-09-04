from django.urls import path

from . import project_views, views
from .event_views import EventListView

app_name = "exposed_api"


urlpatterns = [
    # Project endpoints
    path("projects/", project_views.ProjectDetailView.as_view(), name="project_create_or_list"),
    path("projects/<int:_id>/", project_views.ProjectDetailView.as_view(), name="project_detail_or_crud"),
    # Events endpoint
    path("events/", EventListView.as_view(), name="events_list"),
    # Other endpoints
    path("user/<int:user_id>/", views.user_detail, name="user_detail"),
    path("projectViews/<int:user_id>/", views.project_views, name="project_views"),
    path("projectEngagement/<int:user_id>/", views.project_engagement, name="project_engagement"),
]
