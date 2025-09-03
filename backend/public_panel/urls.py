from django.urls import path

from . import views

app_name = 'exposed_api'

urlpatterns = [
    path('projects/', views.projects_list, name='projects_list'),
    path('projects/<int:project_id>/', views.project_detail, name='project_detail'),
    path('user/<int:user_id>/', views.user_detail, name='user_detail'),
    path('projectViews/<int:user_id>/', views.project_views, name='project_views'),
    path('projectEngagement/<int:user_id>/', views.project_engagement, name='project_engagement'),
]
