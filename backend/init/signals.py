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

# Check if signals should be disabled (for tests)
DISABLE_SIGNALS = os.environ.get("DISABLE_SIGNALS", "False").lower() == "true"

# Flag to track if handlers have already run
_handlers_executed = {
    "create_superuser": False,
    "fetch_news": False,
    "fetch_events": False,
    "fetch_startups": False,
    "fetch_users": False,
    "fetch_investors": False,
    "fetch_partners": False,
}


def create_admin_user_with_id_zero():
    """
    Create a superuser with ID=0
    This is used by the fetch_users handler to ensure correct order
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
    The superuser is mainly created by fetch_users to ensure correct order.
    """
    if DISABLE_SIGNALS:
        return

    # Skip if already executed or if fetch_users has already run
    if _handlers_executed["create_superuser"] or _handlers_executed["fetch_users"]:
        return
    _handlers_executed["create_superuser"] = True

    # This will only run if fetch_users hasn't run yet
    create_admin_user_with_id_zero()


@receiver(post_migrate)
def fetch_news(sender, **kwargs):
    """
    Fetch and create new news from JEB API
    Only runs once during server startup
    """
    if DISABLE_SIGNALS:
        return

    if _handlers_executed["fetch_news"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["fetch_news"] = True

    try:
        fetch_and_create_news()

    except Exception as e:
        print(f"Error during news data management: {e}")


@receiver(post_migrate)
def fetch_events(sender, **kwargs):
    """
    Fetch and create new events from JEB API
    Only runs once during server startup
    """
    if DISABLE_SIGNALS:
        return

    if _handlers_executed["fetch_events"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["fetch_events"] = True

    try:
        fetch_and_create_events()

    except Exception as e:
        print(f"Error during event data management: {e}")


@receiver(post_migrate)
def fetch_startups(sender, **kwargs):
    """
    Fetch and create new startups from JEB API
    Only runs once during server startup
    """
    if DISABLE_SIGNALS:
        return

    if _handlers_executed["fetch_startups"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["fetch_startups"] = True

    try:
        fetch_and_create_startups()

    except Exception as e:
        print(f"Error during startup data management: {e}")


@receiver(post_migrate)
def fetch_users(sender, **kwargs):
    """
    Fetch and create new users from JEB API
    Only runs once during server startup
    This will also create the superuser with ID=0 after fetching all users
    """
    if DISABLE_SIGNALS:
        return

    if _handlers_executed["fetch_users"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["fetch_users"] = True

    try:
        fetch_and_create_users()
        create_admin_user_with_id_zero()
        _handlers_executed["create_superuser"] = True

    except Exception as e:
        print(f"Error during user data management: {e}")


@receiver(post_migrate)
def fetch_investors(sender, **kwargs):
    """
    Fetch and create new investors from JEB API
    Only runs once during server startup
    """
    if DISABLE_SIGNALS:
        return

    if _handlers_executed["fetch_investors"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["fetch_investors"] = True

    try:
        fetch_and_create_investors()

    except Exception as e:
        print(f"Error during investor data management: {e}")


@receiver(post_migrate)
def fetch_partners(sender, **kwargs):
    """
    Fetch and create new partners from JEB API
    Only runs once during server startup
    """
    if DISABLE_SIGNALS:
        return

    if _handlers_executed["fetch_partners"]:
        return
    if sender.name != "admin_panel":
        return
    _handlers_executed["fetch_partners"] = True

    try:
        fetch_and_create_partners()

    except Exception as e:
        print(f"Error during partner data management: {e}")


# Thread and Message signals for Socket.IO notifications
import socketio  # noqa: E402
from django.conf import settings  # noqa: E402
from django.db.models.signals import post_delete, post_save  # noqa: E402
from messaging.models import Message, Thread  # noqa: E402


@receiver(post_save, sender=Thread)
def thread_created_or_updated(sender, instance, created, **kwargs):
    if DISABLE_SIGNALS:
        return

    try:
        from backend.asgi import sio
    except ImportError:
        return

    participants = []
    for participant in instance.participants.all():
        participants.append({"id": participant.id, "name": participant.name, "email": participant.email})

    event_data = {
        "thread_id": instance.id,
        "participants": participants,
        "created_at": instance.created_at.isoformat() if created else None,
        "last_message_at": instance.last_message_at.isoformat(),
    }

    for participant in instance.participants.all():
        room_name = f"user_{participant.id}_threads"
        try:
            from asgiref.sync import async_to_sync

            async_to_sync(sio.emit)("thread_created" if created else "thread_updated", event_data, room=room_name)
        except Exception:
            pass


@receiver(post_save, sender=Message)
def message_created(sender, instance, created, **kwargs):
    if DISABLE_SIGNALS or not created:
        return

    try:
        from backend.asgi import sio
    except ImportError:
        return

    event_data = {
        "thread_id": instance.thread.id,
        "message_id": instance.id,
        "sender_id": instance.sender.id,
        "body": instance.body,
        "created_at": instance.created_at.isoformat(),
    }

    participants = list(instance.thread.participants.exclude(id=instance.sender.id))

    for participant in participants:
        room_name = f"user_{participant.id}_threads"
        try:
            from asgiref.sync import async_to_sync

            async_to_sync(sio.emit)("message_received", event_data, room=room_name)
        except Exception:
            pass

    instance.thread.last_message_at = instance.created_at
    instance.thread.save(update_fields=["last_message_at"])
