from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from exposed_api.models import SiteStatistics
from auditlog.models import AuditLog

from .models import PasswordResetToken
from .serializers import (
    CustomTokenObtainPairSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses our custom serializer
    """

    serializer_class = CustomTokenObtainPairSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        today = timezone.now().date()
        stats, created = SiteStatistics.objects.get_or_create(date=today)
        stats.new_signups += 1
        stats.save()

        AuditLog.objects.create(
            action=f"New user registered: {user.name} ({user.email})",
            user=user.name,
            type="user"
        )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get authenticated user's profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update authenticated user's profile
    """
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        user = serializer.save()

        AuditLog.objects.create(
            action=f"User profile updated: {user.name} ({user.email})",
            user=user.name,
            type="user"
        )

        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset email

    This view handles password reset requests:
    1. Validates the email
    2. Creates a unique token for the user
    3. Sends an email with a reset link
    4. Returns a success message (even if the email doesn't exist for security reasons)
    """
    print("\t\tPassword reset requested")
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            token = PasswordResetToken.objects.create(user=user)

            # Use port 3000 for frontend instead of backend port
            frontend_host = request.get_host().replace("8000", "3000")
            reset_url = f"{request.scheme}://{frontend_host}/reset-password/confirm?token={token.token}"

            # Subject
            subject = "JEB Incubator Password Reset"

            # Context for email template
            context = {"user": user, "reset_url": reset_url, "timeout_hours": settings.PASSWORD_RESET_TIMEOUT}

            html_message = render_to_string("authentication/password_reset_email.html", context)

            # Fallback
            plain_message = f"""
            Hello {user.name},

            You have requested a password reset for your account.
            Please click the link below to set a new password:

            {reset_url}

            This link expires in {settings.PASSWORD_RESET_TIMEOUT} hours.

            If you did not request this password reset, you can safely ignore this email.

            The JEB Incubator Team
            """

            try:
                send_mail(
                    subject,
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                    html_message=html_message,
                )
            except Exception as e:
                print(f"Error sending password reset email: {e}")

            return Response(
                {"detail": "Password reset instructions have been sent to your email address."},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "Password reset instructions have been sent to your email address."},
                status=status.HTTP_200_OK,
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    """
    Confirm password reset with token and set new password

    This view handles password reset confirmation:
    1. Validates the token and new password
    2. Updates the user's password
    3. Marks the token as used to prevent reuse
    4. Returns a success message

    The token is expected to be in request.data or in query parameters if coming from the email link
    """

    if request.query_params.get("token") and not request.data.get("token"):
        request.data._mutable = True
        request.data["token"] = request.query_params.get("token")
        request.data._mutable = False

    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        AuditLog.objects.create(
            action=f"Password reset completed: {user.name} ({user.email})",
            user=user.name,
            type="user"
        )

        return Response({"detail": "Your password has been successfully reset."}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Blacklist the refresh token to logout
    """
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_token(request):
    """
    Verify the validity of the provided token
    """
    return Response({"detail": "Token is valid."}, status=status.HTTP_200_OK)
