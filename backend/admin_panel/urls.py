##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## urls
##

from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    path('', views.admin_panel_home, name='admin_panel_home'),
]
