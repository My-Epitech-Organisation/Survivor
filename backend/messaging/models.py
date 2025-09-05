from django.conf import settings
from django.db import models
from django.utils import timezone


class Thread(models.Model):
    """
    A conversation thread between users.
    """

    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="threads")
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-last_message_at"]

    def __str__(self):
        """
        String representation of the Thread model.
        """
        return f"Thread {self.id} - {', '.join([str(p) for p in self.participants.all()])}"


class Message(models.Model):
    """
    A message within a thread.
    """

    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        """
        String representation of the Message model.
        """
        return f"Message {self.id} by {self.sender} in Thread {self.thread.id}"


class ReadReceipt(models.Model):
    """
    Records when a user has read messages in a thread up to a certain message.
    """

    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name="read_receipts")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="read_receipts")
    last_read_message = models.ForeignKey(Message, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["thread", "user"]

    def __str__(self):
        """
        String representation of the ReadReceipt model.
        """
        return f"Read receipt for {self.user} in Thread {self.thread.id}"


class TypingIndicator(models.Model):
    """
    Records when a user is typing in a thread.
    """

    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name="typing_indicators")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="typing_indicators")
    started_at = models.DateTimeField(auto_now=True)
    is_typing = models.BooleanField(default=True)

    class Meta:
        unique_together = ["thread", "user"]

    def __str__(self):
        """
        String representation of the TypingIndicator model.
        """
        return f"Typing indicator for {self.user} in Thread {self.thread.id}"
