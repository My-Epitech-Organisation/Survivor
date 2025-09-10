from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from authentication.serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    CustomTokenObtainPairSerializer
)
from authentication.models import PasswordResetToken

User = get_user_model()


class UserRegistrationSerializerTest(TestCase):
    def test_valid_registration(self):
        """Test valid user registration"""
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "Password123!",
            "password_confirm": "Password123!",
            "role": "user"
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.role, "user")

    def test_password_mismatch(self):
        """Test password mismatch validation"""
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "Password123!",
            "password_confirm": "Password456!"
        }
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)


class UserSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            name="Test User",
            password="Password123!"
        )

    def test_user_serialization(self):
        """Test user serialization"""
        serializer = UserSerializer(self.user)
        data = serializer.data
        self.assertEqual(data["email"], "test@example.com")
        self.assertEqual(data["name"], "Test User")
        self.assertEqual(data["role"], "user")


class PasswordResetRequestSerializerTest(TestCase):
    def test_valid_email(self):
        """Test valid email for password reset request"""
        data = {"email": "test@example.com"}
        serializer = PasswordResetRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_invalid_email(self):
        """Test invalid email"""
        data = {"email": "invalid-email"}
        serializer = PasswordResetRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())


class PasswordResetConfirmSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            name="Test User",
            password="Password123!"
        )
        self.token = PasswordResetToken.objects.create(user=self.user)

    def test_valid_reset(self):
        """Test valid password reset"""
        data = {
            "token": self.token.token,
            "password": "NewPassword123!",
            "password_confirm": "NewPassword123!"
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertTrue(user.check_password("NewPassword123!"))

    def test_invalid_token(self):
        """Test invalid token"""
        data = {
            "token": "invalid-token",
            "password": "NewPassword123!",
            "password_confirm": "NewPassword123!"
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("token", serializer.errors)


class CustomTokenObtainPairSerializerTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            name="Test User",
            password="Password123!"
        )

    def test_token_obtain(self):
        """Test obtaining token with custom serializer"""
        data = {"email": "test@example.com", "password": "Password123!"}
        serializer = CustomTokenObtainPairSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        validated_data = serializer.validated_data
        self.assertIn("user", validated_data)
        self.assertEqual(validated_data["user"]["email"], "test@example.com")
