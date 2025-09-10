from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from admin_panel.models import Event, NewsDetail, StartupDetail

User = get_user_model()


class AdminPanelViewsTest(APITestCase):
    def setUp(self):
        # Create a superuser for admin access
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com", name="Admin User", password="password123"
        )
        self.client.force_authenticate(user=self.admin_user)

        # Create regular user
        self.regular_user = User.objects.create_user(
            email="user@example.com", name="Regular User", password="password123"
        )

    def test_admin_panel_home_admin_access(self):
        """Test admin panel home view with admin user"""
        url = reverse("admin_panel:admin_panel_home")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["message"], "Welcome to the admin panel")

    def test_admin_panel_home_no_auth(self):
        """Test admin panel home view without authentication"""
        self.client.force_authenticate(user=None)
        url = reverse("admin_panel:admin_panel_home")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_panel_home_regular_user(self):
        """Test admin panel home view with regular user"""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse("admin_panel:admin_panel_home")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fetch_news_temp_allow_any(self):
        """Test fetch news temp view (allow any)"""
        url = reverse("admin_panel:fetch_news_temp")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["message"], "News data fetch initiated")
