from django.test import TestCase
from django.utils import timezone

from authentication.models import CustomUser, PasswordResetToken


class CustomUserModelTest(TestCase):
    def test_create_user(self):
        """Test creating a regular user"""
        user = CustomUser.objects.create_user(email="test@example.com", name="Test User", password="Password123!")
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.name, "Test User")
        self.assertEqual(user.role, "user")
        self.assertTrue(user.check_password("Password123!"))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        """Test creating a superuser"""
        user = CustomUser.objects.create_superuser(
            email="admin@example.com", name="Admin User", password="Password123!"
        )
        self.assertEqual(user.email, "admin@example.com")
        self.assertEqual(user.role, "admin")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_user_str(self):
        """Test string representation of user"""
        user = CustomUser.objects.create_user(email="test@example.com", name="Test User", password="Password123!")
        self.assertEqual(str(user), "test@example.com")


class PasswordResetTokenModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(email="test@example.com", name="Test User", password="Password123!")

    def test_create_token(self):
        """Test creating a password reset token"""
        token = PasswordResetToken.objects.create(user=self.user)
        self.assertIsNotNone(token.token)
        self.assertEqual(token.user, self.user)
        self.assertFalse(token.is_used)
        self.assertIsNotNone(token.expires_at)

    def test_token_str(self):
        """Test string representation of token"""
        token = PasswordResetToken.objects.create(user=self.user)
        self.assertIn("test@example.com", str(token))

    def test_token_is_valid(self):
        """Test token validity"""
        token = PasswordResetToken.objects.create(user=self.user)
        self.assertTrue(token.is_valid())

        # Test expired token
        token.expires_at = timezone.now() - timezone.timedelta(hours=1)
        self.assertFalse(token.is_valid())

        # Test used token
        token.expires_at = timezone.now() + timezone.timedelta(hours=1)
        token.is_used = True
        self.assertFalse(token.is_valid())
