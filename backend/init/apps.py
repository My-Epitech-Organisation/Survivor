##
## EPITECH PROJECT, 2025
## Survivor
## File description:
## apps
##

from django.apps import AppConfig


class InitConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "init"

    def ready(self):
        """
        Import signals when Django is ready and start the scheduler
        """
        import os
        import sys

        import init.signals

        # Only start scheduler in the main process (RUN_MAIN is set by Django in the child process)
        if os.environ.get("RUN_MAIN") != "true":
            from init.scheduler import start_scheduler

            start_scheduler()
