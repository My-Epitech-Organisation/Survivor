from authentication.models import CustomUser
from django.db import models
from django.utils import timezone

from admin_panel.models import StartupDetail


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
        StartupDetail, on_delete=models.CASCADE, related_name="views", help_text="The project that was viewed"
    )
    timestamp = models.DateTimeField(auto_now_add=True, help_text="When the project was viewed")
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_views",
        help_text="The user who viewed the project (if authenticated)",
    )
    ip_address = models.GenericIPAddressField(
        null=True, blank=True, help_text="IP address of the viewer (for tracking unique views)"
    )
    session_key = models.CharField(
        max_length=40, null=True, blank=True, help_text="Session key for anonymous users to track unique views"
    )

    class Meta:
        verbose_name = "Project View"
        verbose_name_plural = "Project Views"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["timestamp"]),
            models.Index(fields=["user"]),
            models.Index(fields=["ip_address"]),
        ]

    def __str__(self):
        """Return a human-readable representation of this view event.

        The returned string is formatted as "<project name> viewed by <user_info> at <timestamp>".
        If the view has an associated user, <user_info> is the user's email; otherwise it is
        "Anonymous (<ip_address>)".

        Returns:
            str: A descriptive string for this view event.
        """
        user_info = self.user.email if self.user else f"Anonymous ({self.ip_address})"
        return f"{self.project.name} viewed by {user_info} at {self.timestamp}"


class ProjectLike(models.Model):
    """
    Model for tracking likes on project/startup pages
    """

    project = models.ForeignKey(
        StartupDetail, on_delete=models.CASCADE, related_name="likes", help_text="The project that was liked"
    )
    timestamp = models.DateTimeField(auto_now_add=True, help_text="When the project was liked")
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_likes",
        help_text="The user who liked the project (if authenticated)",
    )
    ip_address = models.GenericIPAddressField(
        null=True, blank=True, help_text="IP address of the liker (for tracking unique likes)"
    )
    session_key = models.CharField(
        max_length=40, null=True, blank=True, help_text="Session key for anonymous users to track unique likes"
    )

    class Meta:
        verbose_name = "Project Like"
        verbose_name_plural = "Project Likes"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["timestamp"]),
            models.Index(fields=["user"]),
            models.Index(fields=["ip_address"]),
        ]
        # Prevent duplicate likes from same user/IP/session
        unique_together = [
            ("project", "user"),
            ("project", "ip_address", "session_key"),
        ]

    def __str__(self):
        """Return a human-readable representation of this like event.

        The returned string is formatted as "<project name> liked by <user_info> at <timestamp>".
        If the like has an associated user, <user_info> is the user's email; otherwise it is
        "Anonymous (<ip_address>)".

        Returns:
            str: A descriptive string for this like event.
        """
        user_info = self.user.email if self.user else f"Anonymous ({self.ip_address})"
        return f"{self.project.name} liked by {user_info} at {self.timestamp}"


class ProjectDislike(models.Model):
    """
    Model for tracking dislikes on project/startup pages
    """

    project = models.ForeignKey(
        StartupDetail, on_delete=models.CASCADE, related_name="dislikes", help_text="The project that was disliked"
    )
    timestamp = models.DateTimeField(auto_now_add=True, help_text="When the project was disliked")
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_dislikes",
        help_text="The user who disliked the project (if authenticated)",
    )
    ip_address = models.GenericIPAddressField(
        null=True, blank=True, help_text="IP address of the disliker (for tracking unique dislikes)"
    )
    session_key = models.CharField(
        max_length=40, null=True, blank=True, help_text="Session key for anonymous users to track unique dislikes"
    )

    class Meta:
        verbose_name = "Project Dislike"
        verbose_name_plural = "Project Dislikes"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["timestamp"]),
            models.Index(fields=["user"]),
            models.Index(fields=["ip_address"]),
        ]
        # Prevent duplicate dislikes from same user/IP/session
        unique_together = [
            ("project", "user"),
            ("project", "ip_address", "session_key"),
        ]

    def __str__(self):
        """Return a human-readable representation of this dislike event.

        The returned string is formatted as "<project name> disliked by <user_info> at <timestamp>".
        If the dislike has an associated user, <user_info> is the user's email; otherwise it is
        "Anonymous (<ip_address>)".

        Returns:
            str: A descriptive string for this dislike event.
        """
        user_info = self.user.email if self.user else f"Anonymous ({self.ip_address})"
        return f"{self.project.name} disliked by {user_info} at {self.timestamp}"


class ProjectShare(models.Model):
    """
    Model for tracking shares on project/startup pages
    """

    project = models.ForeignKey(
        StartupDetail, on_delete=models.CASCADE, related_name="shares", help_text="The project that was shared"
    )
    timestamp = models.DateTimeField(auto_now_add=True, help_text="When the project was shared")
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="project_shares",
        help_text="The user who shared the project (if authenticated)",
    )
    ip_address = models.GenericIPAddressField(
        null=True, blank=True, help_text="IP address of the sharer (for tracking unique shares)"
    )
    session_key = models.CharField(
        max_length=40, null=True, blank=True, help_text="Session key for anonymous users to track unique shares"
    )
    platform = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Platform where the project was shared (e.g., 'facebook', 'twitter', 'linkedin')",
    )

    class Meta:
        verbose_name = "Project Share"
        verbose_name_plural = "Project Shares"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["project"]),
            models.Index(fields=["timestamp"]),
            models.Index(fields=["user"]),
            models.Index(fields=["ip_address"]),
            models.Index(fields=["platform"]),
        ]

    def __str__(self):
        """Return a human-readable representation of this share event.

        The returned string is formatted as "<project name> shared by <user_info> at <timestamp>".
        If the share has an associated user, <user_info> is the user's email; otherwise it is
        "Anonymous (<ip_address>)".

        Returns:
            str: A descriptive string for this share event.
        """
        user_info = self.user.email if self.user else f"Anonymous ({self.ip_address})"
        platform_info = f" on {self.platform}" if self.platform else ""
        return f"{self.project.name} shared by {user_info}{platform_info} at {self.timestamp}"
