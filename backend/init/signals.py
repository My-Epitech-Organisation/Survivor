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

@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    """
    Create a default admin user after migrations are applied if no admin user exists
    """
    User = get_user_model()

    username = 'admin'
    email = 'admin@example.com'
    password = 'admin'

    if not User.objects.filter(username=username).exists():
        print(f"Creating default admin user '{username}'")
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        print("Default admin user created successfully")
