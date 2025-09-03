from django.urls import path


from . import views
from . import project_views
from .event_views import EventListView

app_name = "exposed_api"


urlpatterns = [
    # Project CRUD (admin only)
    path("projects/", project_views.ProjectDetailView.as_view(), name="project_create"),  # POST (create)
    path("projects/<int:id>", project_views.ProjectDetailView.as_view(), name="project_crud"),  # PUT, DELETE

    # Project GETs (public)
    path("projects/", project_views.projects_list, name="projects_list"),
    path("projects/<int:project_id>/", project_views.project_detail, name="project_detail"),

    # Other endpoints
    path("user/<int:user_id>/", views.user_detail, name="user_detail"),
    path("projectViews/<int:user_id>/", views.project_views, name="project_views"),
    path("projectEngagement/<int:user_id>/", views.project_engagement, name="project_engagement"),

    # Events endpoint
    path("events/", EventListView.as_view(), name="events_list"),
]
