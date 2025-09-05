from authentication.permissions import IsAdmin, IsFounder, IsInvestor, IsNotRegularUser
from django.db.models import F
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin_panel.models import StartupDetail

from .models import ProjectView
from .serializers import (
    ProjectDetailSerializer,
    ProjectEngagementSerializer,
    ProjectSerializer,
    ProjectViewsSerializer,
)


def record_project_view(request, project_id):
    """
    Utility function to record a view for a project.
    This handles both authenticated and anonymous users.

    Args:
        request: The HTTP request object
        project_id: The ID of the project being viewed

    Returns:
        bool: True if the view was recorded, False otherwise
    """
    try:
        project = StartupDetail.objects.get(id=project_id)

        # Get user if authenticated
        user = request.user if request.user.is_authenticated else None

        # Get IP address
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(",")[0]
        else:
            ip_address = request.META.get("REMOTE_ADDR")

        # Get session key for anonymous users
        session_key = request.session.session_key
        if not session_key and not user:
            # If no session exists and user is anonymous, create a session
            request.session.save()
            session_key = request.session.session_key

        # Create the view record
        ProjectView.objects.create(project=project, user=user, ip_address=ip_address, session_key=session_key)

        return True
    except StartupDetail.DoesNotExist:
        return False
    except Exception:
        # Log the exception but don't let it break the view
        import logging

        logger = logging.getLogger(__name__)
        logger.exception("Error recording project view")
        return False


class IsAuthenticatedNotRegularUser(IsAuthenticated):
    """
    Custom permission to allow any authenticated user except regular users
    """

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role != "user"


@api_view(["GET"])
@permission_classes([IsAuthenticatedNotRegularUser])
def project_views(request, user_id):
    """
    Returns the views of the user's projects for the last 6 months.
    This is a placeholder implementation.
    Restricted to authenticated users with roles other than regular users.
    Users can only access their own data unless they are admins.
    """
    # Check if user is accessing their own data or is an admin
    if str(request.user.id) != str(user_id) and request.user.role != "admin":
        return Response({"error": "You do not have permission to access this data"}, status=status.HTTP_403_FORBIDDEN)

    # Placeholder data
    data = [
        {"month": "January", "views": 186},
        {"month": "February", "views": 305},
        {"month": "March", "views": 237},
        {"month": "April", "views": 173},
        {"month": "May", "views": 209},
        {"month": "June", "views": 314},
    ]

    serializer = ProjectViewsSerializer(data, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedNotRegularUser])
def project_engagement(request, user_id):
    """
    Returns the engagement rate for the user's projects.
    This is a placeholder implementation.
    Restricted to authenticated users with roles other than regular users.
    Users can only access their own data unless they are admins.
    """
    # Check if user is accessing their own data or is an admin
    if str(request.user.id) != str(user_id) and request.user.role != "admin":
        return Response({"error": "You do not have permission to access this data"}, status=status.HTTP_403_FORBIDDEN)

    # Placeholder data
    data = {"rate": 75}

    serializer = ProjectEngagementSerializer(data)
    return Response(serializer.data)
