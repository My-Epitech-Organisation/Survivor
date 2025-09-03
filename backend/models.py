from django.db import models


# Message
class Message(models.Model):
    """
    Represents a message.
    """

    sender = models.CharField(max_length=255, null=False)
    receiver = models.CharField(max_length=255, null=False)
    content = models.TextField(null=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    id = models.IntegerField(null=False, primary_key=True)
