from django.apps import apps
from django.test import TestCase
from auditlog.apps import AuditlogConfig


class AuditLogAppTest(TestCase):
    """Test cases for the auditlog app configuration"""

    def test_app_config(self):
        """Test that the app is properly configured"""
        app_config = apps.get_app_config('auditlog')
        self.assertIsInstance(app_config, AuditlogConfig)
        self.assertEqual(app_config.name, 'auditlog')
        self.assertEqual(app_config.default_auto_field, 'django.db.models.BigAutoField')

    def test_app_models(self):
        """Test that the app contains the expected models"""
        app_models = apps.get_app_config('auditlog').get_models()

        model_names = [model.__name__ for model in app_models]
        self.assertIn('AuditLog', model_names)

        # Verify the AuditLog model is accessible
        audit_log_model = apps.get_model('auditlog', 'AuditLog')
        self.assertEqual(audit_log_model.__name__, 'AuditLog')

    def test_app_label(self):
        """Test that the app has the correct label"""
        app_config = apps.get_app_config('auditlog')
        self.assertEqual(app_config.label, 'auditlog')
