##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## signals
##

import os

from authentication.models import CustomUser
from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.utils import timezone

from exposed_api.models import SiteStatistics

from .utils import *

# Flag to track if handlers have already run
_handlers_executed = {
    "create_superuser": False,
    "clear_and_fetch_news": False,
    "clear_and_fetch_events": False,
    "clear_and_fetch_startups": False,
    "clear_and_fetch_users": False,
    "clear_and_fetch_investors": False,
    "clear_and_fetch_partners": False,
}


def create_admin_user_with_id_zero():
    """
    Create a superuser with ID=0
    This is used by the clear_and_fetch_users handler to ensure correct order
    """
    User = CustomUser

    name = os.environ.get("DJANGO_ADMIN_USERNAME")
    email = os.environ.get("DJANGO_ADMIN_EMAIL")
    password = os.environ.get("DJANGO_ADMIN_PASSWORD")

    if not name or not email or not password:
        raise ImproperlyConfigured(
            "DJANGO_ADMIN_USERNAME, DJANGO_ADMIN_EMAIL, and DJANGO_ADMIN_PASSWORD environment variables are required"
        )

    # Delete any existing superuser with the same email to avoid conflicts
    User.objects.filter(email=email).delete()

    print(f"Creating default admin user '{email}'")
    # Create superuser with forced ID=0
    user = User(
        id=0,
        email=email,
        name=name,
        is_staff=True,
        is_superuser=True,
        is_active=True,
        role="admin",
    )
    user.set_password(password)
    user.save(force_insert=True)
    print("Default admin user created successfully with ID=0")


@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    """
    Create a default admin user after migrations are applied if no admin user exists
    Only runs once during server startup
    Note: This handler is primarily here as a fallback.
    The superuser is mainly created by clear_and_fetch_users to ensure correct order.
    """
    # Skip if already executed or if clear_and_fetch_users has already run
    if _handlers_executed["create_superuser"] or _handlers_executed["clear_and_fetch_users"]:
        return
    _handlers_executed["create_superuser"] = True

    # This will only run if clear_and_fetch_users hasn't run yet
    create_admin_user_with_id_zero()


@receiver(post_migrate)
def clear_and_fetch_news(sender, **kwargs):
    """
    Delete all News and NewsDetails records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed["clear_and_fetch_news"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["clear_and_fetch_news"] = True

    try:
        News = apps.get_model("admin_panel", "News")
        NewsDetail = apps.get_model("admin_panel", "NewsDetail")

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

    if _handlers_executed["clear_and_fetch_events"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["clear_and_fetch_events"] = True

    try:
        Event = apps.get_model("admin_panel", "Event")

        Event.objects.all().delete()

        fetch_and_create_events()

    except Exception as e:
        print(f"Error during event data management: {e}")


@receiver(post_migrate)
def clear_and_fetch_startups(sender, **kwargs):
    """
    Delete all StartupDetail records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed["clear_and_fetch_startups"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["clear_and_fetch_startups"] = True

    try:
        StartupDetail = apps.get_model("admin_panel", "StartupDetail")

        StartupDetail.objects.all().delete()

        fetch_and_create_startups()

    except Exception as e:
        print(f"Error during startup data management: {e}")


@receiver(post_migrate)
def clear_and_fetch_users(sender, **kwargs):
    """
    Delete all User records and then fetch and create new ones from JEB API
    Only runs once during server startup
    This will also create the superuser with ID=0 after fetching all users
    """

    if _handlers_executed["clear_and_fetch_users"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["clear_and_fetch_users"] = True

    try:
        User = apps.get_model("authentication", "CustomUser")
        User.objects.exclude(is_superuser=True).delete()

        today = timezone.now().date()
        stats, created = SiteStatistics.objects.get_or_create(date=today)
        stats.new_signups = 0
        stats.save()

        fetch_and_create_users()
        create_admin_user_with_id_zero()
        _handlers_executed["create_superuser"] = True

    except Exception as e:
        print(f"Error during user data management: {e}")


@receiver(post_migrate)
def clear_and_fetch_investors(sender, **kwargs):
    """
    Delete all Investor records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed["clear_and_fetch_investors"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["clear_and_fetch_investors"] = True

    try:
        Investor = apps.get_model("admin_panel", "Investor")

        Investor.objects.all().delete()

        fetch_and_create_investors()

    except Exception as e:
        print(f"Error during investor data management: {e}")


@receiver(post_migrate)
def clear_and_fetch_partners(sender, **kwargs):
    """
    Delete all Partner records and then fetch and create new ones from JEB API
    Only runs once during server startup
    """

    if _handlers_executed["clear_and_fetch_partners"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["clear_and_fetch_partners"] = True

    try:
        Partner = apps.get_model("admin_panel", "Partner")

        Partner.objects.all().delete()

        fetch_and_create_partners()

    except Exception as e:
        print(f"Error during partner data management: {e}")
