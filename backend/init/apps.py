##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## apps
##

from django.apps import AppConfig


class InitConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'init'

    def ready(self):
        """
        Import signals when Django is ready
        """
        import init.signals
