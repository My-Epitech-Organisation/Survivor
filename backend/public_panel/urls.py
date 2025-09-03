from django.urls import path
from . import views

app_name = 'public_panel'

urlpatterns = [
    path('projects/', views.projects_list, name='projects_list'),
    path('projects/<int:project_id>/', views.project_detail, name='project_detail'),
    path('user/<int:user_id>/', views.user_detail, name='user_detail'),
]
