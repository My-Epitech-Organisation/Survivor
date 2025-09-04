from django.db import models
from django.utils import timezone

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
