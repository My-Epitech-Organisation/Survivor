from django.urls import path

from . import media_views, project_views, user_views, views
from .event_views import EventDetailView, EventListView
from .founder_views import FounderDetailView
from .investor_views import InvestorDetailView
from .kpi_views import (
    monthly_stats,
    most_engaged_projects,
    most_viewed_projects,
    new_signups,
    project_engagement_count,
    project_engagement_over_time,
    project_engagement_stats,
    project_view_stats,
    project_views_count,
    project_views_over_time,
    projects_visibility,
    recent_actions,
    total_events,
    total_startups,
    total_users,
    users_connected_ratio,
)
from .news_views import NewsDetailView, NewsListView
from .opportunity_views import AIAnalysisView, OpportunitiesMatchesView
from .partner_views import PartnerDetailView
from .search_views import AdvancedSearchView
from .user_views import AdminUserView, FounderUsersView, InvestorUsersView

app_name = "exposed_api"


urlpatterns = [
    # Media endpoints
    path("media/upload/", media_views.upload_image, name="media_upload"),
    # Search endpoint
    path("search/", AdvancedSearchView.as_view(), name="advanced_search"),
    # Project endpoints
    path("projects/", project_views.ProjectDetailView.as_view(), name="project_create_or_list"),
    path("projects/<int:_id>/", project_views.ProjectDetailView.as_view(), name="project_detail_or_crud"),
    path("projects/founder/<int:founder_id>/", project_views.projects_by_founder, name="projects_by_founder"),
    path("projects/most-liked-projects/<int:nb_projects>/", project_views.most_liked_projects, name="most_liked_projects"),
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
    # Opportunities / matches
    path("opportunities/matches/", OpportunitiesMatchesView.as_view(), name="opportunities_matches"),
    path("opportunities/ai-analysis/", AIAnalysisView.as_view(), name="ai_analysis_start"),
    path("opportunities/ai-analysis/<str:analysis_id>/", AIAnalysisView.as_view(), name="ai_analysis_status"),
    # User endpoints
    path("user/", user_views.get_current_user, name="current_user"),
    path("user/<int:user_id>/", user_views.user_detail, name="user_detail"),
    path("users/chat_img_name/<int:user_id>/", user_views.user_chat_img_name, name="user_chat_img_name"),
    # Admin user management
    path("users/", AdminUserView.as_view(), name="admin_user_list"),
    path("users/<int:user_id>/", AdminUserView.as_view(), name="admin_user_detail"),
    path("users/investors/", InvestorUsersView.as_view(), name="users_investors_list"),
    path("users/founders/", FounderUsersView.as_view(), name="users_founders_list"),
    # Other endpoints
    path("projectViews/<int:user_id>/", views.project_views, name="project_views"),
    path("projectEngagement/<int:user_id>/", views.project_engagement, name="project_engagement"),
    # KPI endpoints
    path("kpi/total-users/", total_users, name="kpi_total_users"),
    path("kpi/total-startups/", total_startups, name="kpi_total_startups"),
    path("kpi/total-events/", total_events, name="kpi_total_events"),
    path("kpi/new-signups/", new_signups, name="kpi_new_signups"),
    path("kpi/projects-visibility/", projects_visibility, name="kpi_projects_visibility"),
    path("kpi/users-connected/", users_connected_ratio, name="kpi_users_connected"),
    path("kpi/recent-actions/", recent_actions, name="kpi_recent_actions"),
    path("kpi/monthly-stats/", monthly_stats, name="kpi_monthly_stats"),
    # Project view statistics endpoints
    path("kpi/project-views/", project_view_stats, name="kpi_project_views"),
    path("kpi/project-views/<int:project_id>/", project_view_stats, name="kpi_project_views_detail"),
    path("kpi/most-viewed-projects/", most_viewed_projects, name="kpi_most_viewed_projects"),
    path("kpi/project-views-over-time/", project_views_over_time, name="kpi_project_views_over_time"),
    path(
        "kpi/project-views-over-time/<int:project_id>/",
        project_views_over_time,
        name="kpi_project_views_over_time_detail",
    ),
    path("projects/<int:project_id>/view-count/", project_views_count, name="project_views_count"),
    # Project engagement endpoints
    path("projects/<int:project_id>/like/", views.project_like, name="project_like"),
    path("projects/<int:project_id>/dislike/", views.project_dislike, name="project_dislike"),
    path("projects/<int:project_id>/share/", views.project_share, name="project_share"),
    path("projectEngagement/<int:user_id>/", views.project_engagement_stats, name="project_engagement_stats"),
    # KPI Project Engagement endpoints
    path("kpi/project-engagement/", project_engagement_stats, name="kpi_project_engagement"),
    path("kpi/project-engagement/<int:project_id>/", project_engagement_stats, name="kpi_project_engagement_detail"),
    path("kpi/most-engaged-projects/", most_engaged_projects, name="kpi_most_engaged_projects"),
    path("kpi/project-engagement-over-time/", project_engagement_over_time, name="kpi_project_engagement_over_time"),
    path(
        "kpi/project-engagement-over-time/<int:project_id>/",
        project_engagement_over_time,
        name="kpi_project_engagement_over_time_detail",
    ),
    path("projects/<int:project_id>/engagement-count/", project_engagement_count, name="project_engagement_count"),
]
