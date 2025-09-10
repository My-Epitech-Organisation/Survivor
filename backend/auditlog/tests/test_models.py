from django.test import TestCase
from django.utils import timezone

from auditlog.models import AuditLog


class AuditLogModelTest(TestCase):
    """Test cases for the AuditLog model"""

    def test_create_audit_log(self):
        """Test creating a basic audit log entry"""
        audit_log = AuditLog.objects.create(action="User login", user="john_doe", type="user")

        self.assertEqual(audit_log.action, "User login")
        self.assertEqual(audit_log.user, "john_doe")
        self.assertEqual(audit_log.type, "user")
        self.assertIsNotNone(audit_log.timestamp)
        self.assertIsNotNone(audit_log.id)

    def test_audit_log_str_representation(self):
        """Test the string representation of AuditLog"""
        audit_log = AuditLog.objects.create(action="Project created", user="admin", type="project")

        expected_str = "Project created by admin (project)"
        self.assertEqual(str(audit_log), expected_str)

    def test_audit_log_ordering(self):
        """Test that audit logs are ordered by timestamp descending"""
        # Create logs with different timestamps
        older_log = AuditLog.objects.create(action="Old action", user="user1", type="user")
        older_log.timestamp = timezone.now() - timezone.timedelta(hours=1)
        older_log.save()

        newer_log = AuditLog.objects.create(action="New action", user="user2", type="user")

        # Query all logs
        logs = list(AuditLog.objects.all())

        # The newer log should come first
        self.assertEqual(logs[0], newer_log)
        self.assertEqual(logs[1], older_log)

    def test_audit_log_fields_max_length(self):
        """Test field max lengths"""
        audit_log = AuditLog.objects.create(
            action="A" * 255,  # Max length for action
            user="B" * 100,  # Max length for user
            type="C" * 50,  # Max length for type
        )

        self.assertEqual(len(audit_log.action), 255)
        self.assertEqual(len(audit_log.user), 100)
        self.assertEqual(len(audit_log.type), 50)

    def test_audit_log_different_types(self):
        """Test audit logs with different action types"""
        types_to_test = ["user", "project", "event", "news", "admin"]

        for log_type in types_to_test:
            audit_log = AuditLog.objects.create(action=f"Test {log_type} action", user="test_user", type=log_type)
            self.assertEqual(audit_log.type, log_type)
