from django.contrib import admin
from django.test import TestCase

from auditlog.admin import AuditLogAdmin
from auditlog.models import AuditLog


class AuditLogAdminTest(TestCase):
    """Test cases for the AuditLog admin configuration"""

    def setUp(self):
        self.site = admin.site
        self.audit_log_admin = AuditLogAdmin(AuditLog, self.site)

        # Create test data
        self.audit_log = AuditLog.objects.create(action="Test action", user="test_user", type="user")

    def test_list_display(self):
        """Test that the correct fields are displayed in the list view"""
        list_display = self.audit_log_admin.list_display
        expected_fields = ("action", "user", "type", "timestamp")

        for field in expected_fields:
            self.assertIn(field, list_display)

    def test_list_filter(self):
        """Test that the correct filters are available"""
        list_filter = self.audit_log_admin.list_filter
        expected_filters = ("type", "timestamp")

        for filter_field in expected_filters:
            self.assertIn(filter_field, list_filter)

    def test_search_fields(self):
        """Test that the correct fields are searchable"""
        search_fields = self.audit_log_admin.search_fields
        expected_search_fields = ("action", "user", "type")

        for search_field in expected_search_fields:
            self.assertIn(search_field, search_fields)

    def test_readonly_fields(self):
        """Test that timestamp is readonly"""
        readonly_fields = self.audit_log_admin.readonly_fields
        self.assertIn("timestamp", readonly_fields)

    def test_ordering(self):
        """Test that the default ordering is by timestamp descending"""
        ordering = self.audit_log_admin.ordering
        self.assertEqual(ordering, ("-timestamp",))

    def test_admin_registration(self):
        """Test that the model is properly registered with admin"""
        # Check if the model is registered
        self.assertTrue(self.site.is_registered(AuditLog))
