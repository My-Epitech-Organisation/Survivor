from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.models import PasswordResetToken

User = get_user_model()


class RegisterUserViewTest(APITestCase):
    def test_register_user_success(self):
        """Test successful user registration"""
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "Password123!",
            "password_confirm": "Password123!",
        }
        response = self.client.post(reverse("authentication:register"), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_register_user_invalid(self):
        """Test invalid user registration"""
        data = {"email": "invalid-email", "name": "", "password": "pass", "password_confirm": "pass"}
        response = self.client.post(reverse("authentication:register"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", name="Test User", password="Password123!")
        self.client.force_authenticate(user=self.user)

    def test_get_user_profile(self):
        """Test getting user profile"""
        response = self.client.get(reverse("authentication:user_profile"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")

    def test_update_user_profile(self):
        """Test updating user profile"""
        data = {"name": "Updated Name"}
        response = self.client.put(reverse("authentication:update_profile"), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Name")


class PasswordResetViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", name="Test User", password="Password123!")

    def test_request_password_reset(self):
        """Test password reset request"""
        data = {"email": "test@example.com"}
        response = self.client.post(reverse("authentication:password_reset"), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_password_confirm(self):
        """Test password reset confirmation"""
        token = PasswordResetToken.objects.create(user=self.user)
        data = {"token": token.token, "password": "NewPassword123!", "password_confirm": "NewPassword123!"}
        response = self.client.post(reverse("authentication:password_reset_confirm"), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LogoutViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", name="Test User", password="Password123!")
        self.client.force_authenticate(user=self.user)

    def test_logout(self):
        """Test user logout"""
        # First get a refresh token
        login_response = self.client.post(
            reverse("authentication:token_obtain_pair"), {"email": "test@example.com", "password": "Password123!"}
        )
        refresh_token = login_response.data["refresh"]

        data = {"refresh": refresh_token}
        response = self.client.post(reverse("authentication:logout"), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class VerifyTokenViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", name="Test User", password="Password123!")
        self.client.force_authenticate(user=self.user)

    def test_verify_token(self):
        """Test token verification"""
        response = self.client.post(reverse("authentication:verify_token"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LoginViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@example.com", name="Test User", password="Password123!")

    def test_login_success(self):
        """Test successful login"""
        data = {"email": "test@example.com", "password": "Password123!"}
        response = self.client.post(reverse("authentication:token_obtain_pair"), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_invalid(self):
        """Test invalid login"""
        data = {"email": "test@example.com", "password": "WrongPassword123!"}
        response = self.client.post(reverse("authentication:token_obtain_pair"), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
