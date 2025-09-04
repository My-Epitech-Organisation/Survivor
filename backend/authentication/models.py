import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom User Model for authentication and authorization
    """

    ROLE_CHOICES = [
        ("user", "Regular User"),
        ("founder", "Founder"),
        ("investor", "Investor"),
        ("admin", "Administrator"),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")

    founder_id = models.IntegerField(null=True, blank=True)
    investor_id = models.IntegerField(null=True, blank=True)

    image = models.CharField(max_length=255, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    def __str__(self):
        """
        String representation of the CustomUser model
        """
        return self.email

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"


class PasswordResetToken(models.Model):
    """
    Model to store password reset tokens
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Password reset token for {self.user.email}"

    def save(self, *args, **kwargs):
        if not self.expires_at:

            from django.conf import settings
            hours = getattr(settings, 'PASSWORD_RESET_TIMEOUT', 24)
            self.expires_at = timezone.now() + timezone.timedelta(hours=hours)
        super().save(*args, **kwargs)

    def is_valid(self):
        """
        Check if the token is valid:
        - Not expired
        - Not used
        """
        return not self.is_used and timezone.now() < self.expires_at
