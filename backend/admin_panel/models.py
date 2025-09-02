from django.db import models


# News models
class News(models.Model):
    """
    Represents a news item.
    """

    news_date = models.CharField(max_length=255, null=True)
    location = models.CharField(max_length=255, null=True)
    title = models.CharField(max_length=255, null=False)
    category = models.CharField(max_length=255, null=True)
    startup_id = models.IntegerField(null=True)
    id = models.IntegerField(null=False, primary_key=True)

class NewsDetail(models.Model):
    """
    Represents a news detail item.
    """

    news_date = models.CharField(max_length=255, null=True)
    location = models.CharField(max_length=255, null=True)
    title = models.CharField(max_length=255, null=False)
    category = models.CharField(max_length=255, null=True)
    startup_id = models.IntegerField(null=True)
    id = models.IntegerField(null=False, primary_key=True)
    description = models.TextField(null=True, blank=True)
    image = models.BinaryField(null=True, blank=True)

# Event models
class Event(models.Model):
    """
    Represents an event.
    """

    name = models.CharField(max_length=255, blank=False, null=False)
    dates = models.CharField(max_length=255, null=True)
    location = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True, blank=True)
    event_type = models.CharField(max_length=255, null=True)
    target_audience = models.CharField(max_length=255, null=True)
    id = models.IntegerField(null=False, primary_key=True)
    image = models.BinaryField(null=True, blank=True)

# Startup models
class StartupList(models.Model):
    """
    Represents a startup listing.
    """

    id = models.IntegerField(null=False, primary_key=True)
    name = models.CharField(max_length=255, null=False)
    legal_status = models.CharField(max_length=255, null=True)
    address = models.CharField(max_length=255, null=True)
    email = models.CharField(max_length=255, null=False)
    phone = models.CharField(max_length=255, null=True)
    sector = models.CharField(max_length=255, null=True)
    maturity = models.CharField(max_length=255, null=True)
class StartupDetail(models.Model):
    """
    Represents detailed information about a startup.
    """

    id = models.IntegerField(null=False, primary_key=True)
    name = models.CharField(max_length=255, null=False)
    legal_status = models.CharField(max_length=255, null=True)
    address = models.CharField(max_length=255, null=True)
    email = models.CharField(max_length=255, null=False)
    phone = models.CharField(max_length=255, null=True)
    created_at = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True, blank=True)
    website_url = models.CharField(max_length=255, null=True)
    social_media_url = models.CharField(max_length=255, null=True)
    project_status = models.CharField(max_length=255, null=True)
    needs = models.TextField(null=True, blank=True)
    sector = models.CharField(max_length=255, null=True)
    maturity = models.CharField(max_length=255, null=True)
    founders = models.ManyToManyField('Founder', related_name='startups', null=True, blank=True)
    founders_images = models.JSONField(null=True, blank=True)

# Founder models
class Founder(models.Model):
    """
    Represent a founder.
    """

    name = models.CharField(max_length=255, null=False)
    id = models.IntegerField(null=False, primary_key=True)
    startup_id = models.IntegerField(null=False)
