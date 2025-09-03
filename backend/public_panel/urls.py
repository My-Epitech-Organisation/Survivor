from django.urls import path
from . import views

app_name = 'public_panel'

urlpatterns = [
    path('projects/', views.projects_list, name='projects_list'),
]
