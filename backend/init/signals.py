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

@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    """
    Create a default admin user after migrations are applied if no admin user exists
    """
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
