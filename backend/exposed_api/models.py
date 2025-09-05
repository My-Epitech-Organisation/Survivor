from django.db import models
from django.utils import timezone
from authentication.models import CustomUser
from admin_panel.models import StartupDetail

# Create your models here.


class SiteStatistics(models.Model):
    """
    Model for tracking site statistics such as user registrations
    """

    date = models.DateField(default=timezone.now)
    new_signups = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Site Statistics"
        verbose_name_plural = "Site Statistics"
        ordering = ["-date"]


class ProjectView(models.Model):
    """
    Model for tracking views on project/startup pages
    """

    project = models.ForeignKey(
        StartupDetail,
        on_delete=models.CASCADE,
        related_name='views',
        help_text="The project that was viewed"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When the project was viewed"
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='project_views',
        help_text="The user who viewed the project (if authenticated)"
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of the viewer (for tracking unique views)"
    )
    session_key = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        help_text="Session key for anonymous users to track unique views"
    )

    class Meta:
        verbose_name = "Project View"
        verbose_name_plural = "Project Views"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=['project']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['user']),
            models.Index(fields=['ip_address']),
        ]

    def __str__(self):
        user_info = self.user.email if self.user else f"Anonymous ({self.ip_address})"
        return f"{self.project.name} viewed by {user_info} at {self.timestamp}"
