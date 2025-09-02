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
