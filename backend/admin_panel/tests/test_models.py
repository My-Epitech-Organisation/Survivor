from django.test import TestCase

from admin_panel.models import Event, NewsDetail, StartupDetail


class SimpleTestCase(TestCase):
    def test_models_exist(self):
        """Simple test to verify models can be imported"""
        assert NewsDetail is not None
        assert Event is not None
        assert StartupDetail is not None
