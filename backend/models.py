from django.db import models

class Event(models.Model):
    """
    Represents an event.
    """

    name = models.CharField(max_length=255, blank=False, null=False)
    date = models.CharField(max_length=255, null=True)
    location = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True, blank=True)
    event_type = models.CharField(max_length=255, null=True)
    target_audience = models.CharField(max_length=255, null=True)
    id = models.IntegerField(null=False, primary_key=True)


class Investor(models.Model):
    """
    Represents an investor.
    """

    name = models.CharField(max_length=255, null=False)
    legal_status = models.CharField(max_length=255, null=True)
    address = models.CharField(max_length=255, null=True)
    email = models.CharField(max_length=255, null=False)
    phone = models.CharField(max_length=255, null=True)
    created_at = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True, blank=True)
    investor_type = models.CharField(max_length=255, null=True)
    investment_focus = models.CharField(max_length=255, null=True)
    id = models.IntegerField(null=False, primary_key=True)


class Partner(models.Model):
    """
    Represents a partner.
    """

    name = models.CharField(max_length=255, null=False)
    legal_status = models.CharField(max_length=255, null=True)
    address = models.CharField(max_length=255, null=True)
    email = models.CharField(max_length=255, null=False)
    phone = models.CharField(max_length=255, null=True)
    created_at = models.CharField(max_length=255, null=True)
    description = models.TextField(null=True, blank=True)
    partnership_type = models.CharField(max_length=255, null=True)
    id = models.IntegerField(null=False, primary_key=True)


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
    founders = models.ManyToManyField('Founder', related_name='startups')


class User(models.Model):
    """
    Represents a user.
    """

    email = models.CharField(max_length=255, unique=True, null=False)
    name = models.CharField(max_length=255, null=False)
    role = models.CharField(max_length=255, null=False)
    founder_id = models.IntegerField(null=True, blank=True)
    investor_id = models.IntegerField(null=True, blank=True)
    id = models.IntegerField(null=False, primary_key=True)


class Founder(models.Model):
    """
    Represent a founder.
    """

    name = models.CharField(max_length=255,unique=True, null=False)
    id = models.IntegerField(null=False, primary_key=True)
    startup_id = models.IntegerField(null=False)

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


#Message
class Message(models.Model):
    """
    Represents a message.
    """

    sender = models.CharField(max_length=255, null=False)
    receiver = models.CharField(max_length=255, null=False)
    content = models.TextField(null=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    id = models.IntegerField(null=False, primary_key=True)

#Logs (déjà intégré a django?)

#perms (déjà intégré a django?)
