##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## signals
##

from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model
import os
from django.core.exceptions import ImproperlyConfigured
from django.apps import apps
from .utils import *
# Flag to track if handlers have already run
_handlers_executed = {
    'create_superuser': False,
    'clear_and_fetch_news': False,
    'clear_and_fetch_events': False,
    'clear_and_fetch_startups': False,
    'clear_and_fetch_users': False,
    'clear_and_fetch_investors': False
}

@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    """
    Create a default admin user after migrations are applied if no admin user exists
    Only runs once during server startup
    """

    if _handlers_executed['create_superuser']:
        return
    _handlers_executed['create_superuser'] = True

    User = get_user_model()

    username = os.environ.get('DJANGO_ADMIN_USERNAME')
    email = os.environ.get('DJANGO_ADMIN_EMAIL')
    password = os.environ.get('DJANGO_ADMIN_PASSWORD')

    if not username or not email or not password:
        raise ImproperlyConfigured("DJANGO_ADMIN_USERNAME, DJANGO_ADMIN_EMAIL, and DJANGO_ADMIN_PASSWORD environment variables are required")

    if not User.objects.filter(username=username).exists():
        print(f"Creating default admin user '{username}'")
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        print("Default admin user created successfully")

@receiver(post_migrate)
def clear_and_fetch_news(sender, **kwargs):
    """
    Delete all News and NewsDetails records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed['clear_and_fetch_news']:
        return
    if sender.name != 'admin_panel':
        return
    _handlers_executed['clear_and_fetch_news'] = True

    try:
        News = apps.get_model('admin_panel', 'News')
        NewsDetail = apps.get_model('admin_panel', 'NewsDetail')

        News.objects.all().delete()
        NewsDetail.objects.all().delete()

        fetch_and_create_news()

    except Exception as e:
        print(f"Error during news data management: {e}")

@receiver(post_migrate)
def clear_and_fetch_events(sender, **kwargs):
    """
    Delete all Event records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed['clear_and_fetch_events']:
        return
    if sender.name != 'admin_panel':
        return
    _handlers_executed['clear_and_fetch_events'] = True

    try:
        Event = apps.get_model('admin_panel', 'Event')

        Event.objects.all().delete()

        fetch_and_create_events()

    except Exception as e:
        print(f"Error during event data management: {e}")

@receiver(post_migrate)
def clear_and_fetch_startups(sender, **kwargs):
    """
    Delete all StartupList and StartupDetail records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed['clear_and_fetch_startups']:
        return
    if sender.name != 'admin_panel':
        return
    _handlers_executed['clear_and_fetch_startups'] = True

    try:
        StartupList = apps.get_model('admin_panel', 'StartupList')
        StartupDetail = apps.get_model('admin_panel', 'StartupDetail')

        StartupList.objects.all().delete()
        StartupDetail.objects.all().delete()

        fetch_and_create_startups()

    except Exception as e:
        print(f"Error during startup data management: {e}")

@receiver(post_migrate)
def clear_and_fetch_users(sender, **kwargs):
    """
    Delete all User records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed['clear_and_fetch_users']:
        return
    if sender.name != 'admin_panel':
        return
    _handlers_executed['clear_and_fetch_users'] = True

    try:
        User = apps.get_model('admin_panel', 'User')

        User.objects.all().delete()

        fetch_and_create_users()

    except Exception as e:
        print(f"Error during user data management: {e}")

@receiver(post_migrate)
def clear_and_fetch_investors(sender, **kwargs):
    """
    Delete all Investor records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed['clear_and_fetch_investors']:
        return
    if sender.name != 'admin_panel':
        return
    _handlers_executed['clear_and_fetch_investors'] = True

    try:
        Investor = apps.get_model('admin_panel', 'Investor')

        Investor.objects.all().delete()

        fetch_and_create_investors()

    except Exception as e:
        print(f"Error during investor data management: {e}")
