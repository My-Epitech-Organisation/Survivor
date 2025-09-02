from django.db import models

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
