from django.contrib.admin.sites import AdminSite
from django.test import TestCase

from admin_panel.admin import EventAdmin, NewsDetailAdmin, StartupDetailAdmin
from admin_panel.models import Event, NewsDetail, StartupDetail


class AdminTestCase(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.news_admin = NewsDetailAdmin(NewsDetail, self.site)
        self.event_admin = EventAdmin(Event, self.site)
        self.startup_admin = StartupDetailAdmin(StartupDetail, self.site)

    def test_news_admin_list_display(self):
        """Test NewsDetail admin list display"""
        self.assertIn("id", self.news_admin.list_display)
        self.assertIn("title", self.news_admin.list_display)
        self.assertIn("news_date", self.news_admin.list_display)

    def test_event_admin_list_display(self):
        """Test Event admin list display"""
        self.assertIn("id", self.event_admin.list_display)
        self.assertIn("name", self.event_admin.list_display)
        self.assertIn("dates", self.event_admin.list_display)

    def test_startup_admin_list_display(self):
        """Test StartupDetail admin list display"""
        self.assertIn("id", self.startup_admin.list_display)
        self.assertIn("name", self.startup_admin.list_display)
        self.assertIn("legal_status", self.startup_admin.list_display)
