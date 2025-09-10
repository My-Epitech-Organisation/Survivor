from django.contrib.admin.sites import AdminSite
from django.test import TestCase

from auditlog.admin import AuditLogAdmin
from auditlog.models import AuditLog


class AuditLogIntegrationTest(TestCase):
    """Integration tests for auditlog functionality"""

    def setUp(self):
        # Create multiple audit log entries for testing
        self.logs_data = [
            {"action": "User registered", "user": "alice", "type": "user"},
            {"action": "Project created", "user": "bob", "type": "project"},
            {"action": "Event scheduled", "user": "charlie", "type": "event"},
            {"action": "News published", "user": "admin", "type": "news"},
        ]

        self.audit_logs = []
        for log_data in self.logs_data:
            log = AuditLog.objects.create(**log_data)
            self.audit_logs.append(log)

    def test_bulk_create_and_query(self):
        """Test creating multiple logs and querying them"""
        # Verify all logs were created
        self.assertEqual(AuditLog.objects.count(), 4)

        # Test querying by type
        user_logs = AuditLog.objects.filter(type="user")
        self.assertEqual(user_logs.count(), 1)
        self.assertEqual(user_logs.first().user, "alice")

        project_logs = AuditLog.objects.filter(type="project")
        self.assertEqual(project_logs.count(), 1)
        self.assertEqual(project_logs.first().user, "bob")

    def test_admin_list_functionality(self):
        """Test admin list functionality with our test data"""
        site = AdminSite()
        audit_log_admin = AuditLogAdmin(AuditLog, site)

        # Test that we can get queryset
        queryset = audit_log_admin.get_queryset(None)
        self.assertEqual(queryset.count(), 4)

        # Test ordering (should be by -timestamp)
        logs = list(queryset)
        # Since we created them in order, the first should be the most recent
        self.assertEqual(logs[0].action, "News published")
        self.assertEqual(logs[-1].action, "User registered")

    def test_search_functionality(self):
        """Test search functionality"""
        # Search by user
        results = AuditLog.objects.filter(user__icontains="alice")
        self.assertEqual(results.count(), 1)

        # Search by action
        results = AuditLog.objects.filter(action__icontains="created")
        self.assertEqual(results.count(), 1)

        # Search by type
        results = AuditLog.objects.filter(type__icontains="user")
        self.assertEqual(results.count(), 1)

    def test_model_meta_options(self):
        """Test model Meta options"""
        # Test verbose names
        self.assertEqual(AuditLog._meta.verbose_name, "Audit Log")
        self.assertEqual(AuditLog._meta.verbose_name_plural, "Audit Logs")

        # Test ordering
        self.assertEqual(AuditLog._meta.ordering, ["-timestamp"])
