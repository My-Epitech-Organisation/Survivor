from django.db import models

# Create your models here.

class AuditLog(models.Model):
    """
    AuditLog model to track actions in the system.
    """
    id = models.AutoField(primary_key=True)
    action = models.CharField(max_length=255, help_text="Brief description of the action (e.g. 'New startup registered')")
    user = models.CharField(max_length=100, help_text="Name of the user who performed the action")
    type = models.CharField(max_length=50, help_text="Type of the action")
    timestamp = models.DateTimeField(auto_now_add=True, help_text="When the action occurred")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        """
        String representation of the AuditLog entry.
        """
        return f"{self.action} by {self.user} ({self.type})"
