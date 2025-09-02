from django.db import models


# class Investor(models.Model):
#     """
#     Represents an investor.
#     """

#     name = models.CharField(max_length=255, null=False)
#     legal_status = models.CharField(max_length=255, null=True)
#     address = models.CharField(max_length=255, null=True)
#     email = models.CharField(max_length=255, null=False)
#     phone = models.CharField(max_length=255, null=True)
#     created_at = models.CharField(max_length=255, null=True)
#     description = models.TextField(null=True, blank=True)
#     investor_type = models.CharField(max_length=255, null=True)
#     investment_focus = models.CharField(max_length=255, null=True)
#     id = models.IntegerField(null=False, primary_key=True)


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

