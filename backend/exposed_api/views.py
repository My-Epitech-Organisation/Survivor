from authentication.permissions import IsAdmin, IsFounder, IsInvestor, IsNotRegularUser
from django.db.models import F
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from admin_panel.models import Founder, StartupDetail

from .models import ProjectDislike, ProjectLike, ProjectShare, ProjectView
from .serializers import (
    ProjectDetailSerializer,
    ProjectDislikeSerializer,
    ProjectEngagementSerializer,
    ProjectEngagementStatsSerializer,
    ProjectLikeSerializer,
    ProjectSerializer,
    ProjectShareSerializer,
    ProjectViewsSerializer,
)


def record_project_view(request, project_id):
    """
    Utility function to record a view for a project.
    This handles both authenticated and anonymous users.

    Views are NOT counted when a founder views their own project.

    Args:
        request: The HTTP request object
        project_id: The ID of the project being viewed

    Returns:
        bool: True if the view was recorded, False otherwise
    """
    try:
        project = StartupDetail.objects.get(id=project_id)
        user = request.user if request.user.is_authenticated else None
        if (
            user
            and user.role == "founder"
            and user.founder_id is not None
            and project.founders.filter(id=user.founder_id).exists()
        ):
            return True

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_address = x_forwarded_for.split(",")[0] if x_forwarded_for else request.META.get("REMOTE_ADDR")

        session_key = request.session.session_key
        if not session_key and not user:
            request.session.save()
            session_key = request.session.session_key

        ProjectView.objects.create(project=project, user=user, ip_address=ip_address, session_key=session_key)

        return True
    except StartupDetail.DoesNotExist:
        return False
    except Exception:
        import logging

        logger = logging.getLogger(__name__)
        logger.exception("Error recording project view")
        return False


def record_project_like(request, project_id):
    """
    Utility function to record a like for a project.
    This handles both authenticated and anonymous users.

    Likes are now allowed for founders' own projects.

    Args:
        request: The HTTP request object
        project_id: The ID of the project being liked

    Returns:
        dict: A dictionary with 'success' boolean and optional 'message'
    """
    try:
        project = StartupDetail.objects.get(id=project_id)
        user = request.user if request.user.is_authenticated else None

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_address = x_forwarded_for.split(",")[0] if x_forwarded_for else request.META.get("REMOTE_ADDR")

        session_key = request.session.session_key
        if not session_key and not user:
            request.session.save()
            session_key = request.session.session_key

        existing_like = ProjectLike.objects.filter(
            project=project,
            user=user if user else None,
            ip_address=ip_address if not user else None,
            session_key=session_key if not user else None,
        ).first()

        if existing_like:
            return {"success": False, "message": "You have already liked this project"}

        ProjectLike.objects.create(project=project, user=user, ip_address=ip_address, session_key=session_key)

        return {"success": True}
    except StartupDetail.DoesNotExist:
        return {"success": False, "message": "Project not found"}
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.exception("Error recording project like")
        return {"success": False, "message": "An error occurred while recording the like"}


def record_project_dislike(request, project_id):
    """
    Utility function to record a dislike for a project.
    This handles both authenticated and anonymous users.

    Dislikes are now allowed for founders' own projects.

    Args:
        request: The HTTP request object
        project_id: The ID of the project being disliked

    Returns:
        dict: A dictionary with 'success' boolean and optional 'message'
    """
    try:
        project = StartupDetail.objects.get(id=project_id)
        user = request.user if request.user.is_authenticated else None

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_address = x_forwarded_for.split(",")[0] if x_forwarded_for else request.META.get("REMOTE_ADDR")

        session_key = request.session.session_key
        if not session_key and not user:
            request.session.save()
            session_key = request.session.session_key

        existing_dislike = ProjectDislike.objects.filter(
            project=project,
            user=user if user else None,
            ip_address=ip_address if not user else None,
            session_key=session_key if not user else None,
        ).first()

        if existing_dislike:
            return {"success": False, "message": "You have already disliked this project"}

        ProjectDislike.objects.create(project=project, user=user, ip_address=ip_address, session_key=session_key)

        return {"success": True}
    except StartupDetail.DoesNotExist:
        return {"success": False, "message": "Project not found"}
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.exception("Error recording project dislike")
        return {"success": False, "message": "An error occurred while recording the dislike"}


def record_project_share(request, project_id, platform=None):
    """
    Utility function to record a share for a project.
    This handles both authenticated and anonymous users.

    Shares are allowed for founders' own projects.

    Args:
        request: The HTTP request object
        project_id: The ID of the project being shared
        platform: The platform where the share occurred (optional)

    Returns:
        dict: A dictionary with 'success' boolean and optional 'message'
    """
    try:
        project = StartupDetail.objects.get(id=project_id)
        user = request.user if request.user.is_authenticated else None

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_address = x_forwarded_for.split(",")[0] if x_forwarded_for else request.META.get("REMOTE_ADDR")

        session_key = request.session.session_key
        if not session_key and not user:
            request.session.save()
            session_key = request.session.session_key

        ProjectShare.objects.create(
            project=project, user=user, ip_address=ip_address, session_key=session_key, platform=platform
        )

        return {"success": True}
    except StartupDetail.DoesNotExist:
        return {"success": False, "message": "Project not found"}
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.exception("Error recording project share")
        return {"success": False, "message": "An error occurred while recording the share"}


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
    Users can only access their own data unless they are admins or founders.
    """
    # Check if user is accessing their own data or is an admin/founder
    if str(request.user.id) != str(user_id) and request.user.role not in ["admin", "founder"]:
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
    Users can only access their own data unless they are admins or founders.
    """
    # Check if user is accessing their own data or is an admin/founder
    if str(request.user.id) != str(user_id) and request.user.role not in ["admin", "founder"]:
        return Response({"error": "You do not have permission to access this data"}, status=status.HTTP_403_FORBIDDEN)

    # Placeholder data
    data = {"rate": 75}

    serializer = ProjectEngagementSerializer(data)
    return Response(serializer.data)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def project_like(request, project_id):
    """
    API endpoint to like or unlike a project.
    POST: Add like, DELETE: Remove like
    Restricted to authenticated users with roles other than regular users.
    Founders can now like their own projects.
    """
    try:
        project = StartupDetail.objects.get(id=project_id)
        user = request.user if request.user.is_authenticated else None

        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == "POST":
            existing_like = ProjectLike.objects.filter(project=project, user=user).first()

            if existing_like:
                return Response({"error": "You have already liked this project"}, status=status.HTTP_400_BAD_REQUEST)

            ProjectDislike.objects.filter(project=project, user=user).delete()

            ProjectLike.objects.create(project=project, user=user, ip_address=request.META.get("REMOTE_ADDR"))
            return Response({"message": "Project liked successfully"}, status=status.HTTP_201_CREATED)

        if request.method == "DELETE":
            deleted_count, _ = ProjectLike.objects.filter(project=project, user=user).delete()
            if deleted_count > 0:
                return Response({"message": "Like removed successfully"}, status=status.HTTP_200_OK)
            return Response({"error": "You haven't liked this project"}, status=status.HTTP_400_BAD_REQUEST)

    except StartupDetail.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.exception("Error handling project like")
        return Response({"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticatedNotRegularUser])
def project_dislike(request, project_id):
    """
    API endpoint to dislike or undislike a project.
    POST: Add dislike, DELETE: Remove dislike
    Restricted to authenticated users with roles other than regular users.
    Founders can now dislike their own projects.
    """
    try:
        project = StartupDetail.objects.get(id=project_id)
        user = request.user if request.user.is_authenticated else None

        if not user:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == "POST":
            existing_dislike = ProjectDislike.objects.filter(project=project, user=user).first()

            if existing_dislike:
                return Response(
                    {"error": "You have already disliked this project"}, status=status.HTTP_400_BAD_REQUEST
                )

            ProjectLike.objects.filter(project=project, user=user).delete()

            ProjectDislike.objects.create(project=project, user=user, ip_address=request.META.get("REMOTE_ADDR"))
            return Response({"message": "Project disliked successfully"}, status=status.HTTP_201_CREATED)

        if request.method == "DELETE":
            deleted_count, _ = ProjectDislike.objects.filter(project=project, user=user).delete()
            if deleted_count > 0:
                return Response({"message": "Dislike removed successfully"}, status=status.HTTP_200_OK)
            return Response({"error": "You haven't disliked this project"}, status=status.HTTP_400_BAD_REQUEST)

    except StartupDetail.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import logging

        logger = logging.getLogger(__name__)
        logger.exception("Error handling project dislike")
        return Response({"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([IsAuthenticatedNotRegularUser])
def project_share(request, project_id):
    """
    API endpoint to share a project.
    Restricted to authenticated users with roles other than regular users.
    """
    platform = request.data.get("platform")
    result = record_project_share(request, project_id, platform)

    if result["success"]:
        return Response({"message": "Project shared successfully"}, status=status.HTTP_201_CREATED)
    message = result.get("message", "Failed to share project")
    return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticatedNotRegularUser])
def project_engagement_stats(request, user_id):
    """
    Returns the engagement statistics (likes, dislikes, shares) for the user's projects.
    Restricted to authenticated users with roles other than regular users.
    Users can only access their own data unless they are admins or founders.
    """
    if str(request.user.id) != str(user_id) and request.user.role not in ["admin", "founder"]:
        return Response({"error": "You do not have permission to access this data"}, status=status.HTTP_403_FORBIDDEN)

    if request.user.role == "founder" and request.user.founder_id:
        try:
            from admin_panel.models import Founder

            founder = Founder.objects.get(id=request.user.founder_id)
            projects = founder.startups.all()
        except Founder.DoesNotExist:
            return Response({"error": "Founder profile not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        projects = StartupDetail.objects.all()

    project_ids = projects.values_list("id", flat=True)

    total_likes = ProjectLike.objects.filter(project_id__in=project_ids).count()
    total_dislikes = ProjectDislike.objects.filter(project_id__in=project_ids).count()
    total_shares = ProjectShare.objects.filter(project_id__in=project_ids).count()

    unique_likers = (
        ProjectLike.objects.filter(project_id__in=project_ids)
        .values("user", "ip_address", "session_key")
        .distinct()
        .count()
    )
    unique_dislikers = (
        ProjectDislike.objects.filter(project_id__in=project_ids)
        .values("user", "ip_address", "session_key")
        .distinct()
        .count()
    )
    unique_sharers = (
        ProjectShare.objects.filter(project_id__in=project_ids)
        .values("user", "ip_address", "session_key")
        .distinct()
        .count()
    )

    data = {
        "total_likes": total_likes,
        "total_dislikes": total_dislikes,
        "total_shares": total_shares,
        "unique_likers": unique_likers,
        "unique_dislikers": unique_dislikers,
        "unique_sharers": unique_sharers,
    }

    serializer = ProjectEngagementStatsSerializer(data)
    return Response(serializer.data)
