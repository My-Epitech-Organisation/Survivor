from django.urls import path

from . import project_views, user_views, views
from .event_views import EventDetailView, EventListView
from .founder_views import FounderDetailView
from .investor_views import InvestorDetailView
from .kpi_views import new_signups, projects_visibility, total_events, total_startups, total_users
from .news_views import NewsDetailView, NewsListView
from .partner_views import PartnerDetailView

app_name = "exposed_api"


urlpatterns = [
    # Project endpoints
    path("projects/", project_views.ProjectDetailView.as_view(), name="project_create_or_list"),
    path("projects/<int:_id>/", project_views.ProjectDetailView.as_view(), name="project_detail_or_crud"),
    path("projects/founder/<int:founder_id>/", project_views.projects_by_founder, name="projects_by_founder"),
    # Events endpoints
    path("events/", EventListView.as_view(), name="events_list"),
    path("events/<int:event_id>/", EventDetailView.as_view(), name="event_detail"),
    # News endpoints
    path("news/", NewsListView.as_view(), name="news_list"),
    path("news/<int:news_id>/", NewsDetailView.as_view(), name="news_detail"),
    # Founders endpoints
    path("founders/", FounderDetailView.as_view(), name="founder_create_or_list"),
    path("founders/<int:_id>/", FounderDetailView.as_view(), name="founder_detail_or_crud"),
    # Investors endpoints
    path("investors/", InvestorDetailView.as_view(), name="investor_create_or_list"),
    path("investors/<int:_id>/", InvestorDetailView.as_view(), name="investor_detail_or_crud"),
    # Partners endpoints
    path("partners/", PartnerDetailView.as_view(), name="partner_create_or_list"),
    path("partners/<int:_id>/", PartnerDetailView.as_view(), name="partner_detail_or_crud"),
    # User endpoints
    path("user/", user_views.get_current_user, name="current_user"),
    path("user/<int:user_id>/", user_views.user_detail, name="user_detail"),
    # Other endpoints
    path("projectViews/<int:user_id>/", views.project_views, name="project_views"),
    path("projectEngagement/<int:user_id>/", views.project_engagement, name="project_engagement"),
    # KPI endpoints
    path("kpi/total-users/", total_users, name="kpi_total_users"),
    path("kpi/total-startups/", total_startups, name="kpi_total_startups"),
    path("kpi/total-events/", total_events, name="kpi_total_events"),
    path("kpi/new-signups/", new_signups, name="kpi_new_signups"),
    path("kpi/projects-visibility/", projects_visibility, name="kpi_projects_visibility"),
]
