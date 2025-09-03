from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from admin_panel.models import StartupDetail, User
from .serializers import (ProjectSerializer, ProjectDetailSerializer, UserSerializer,
                         ProjectViewsSerializer, ProjectEngagementSerializer)
from authentication.permissions import IsAdmin, IsFounder, IsInvestor, IsNotRegularUser


class IsAuthenticatedNotRegularUser(IsAuthenticated):
    """
    Custom permission to allow any authenticated user except regular users
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role != 'user'

@api_view(['GET'])
@permission_classes([AllowAny])
def projects_list(request):
    """
    API endpoint that returns a list of all projects/startups.
    """
    startups = StartupDetail.objects.all()
    serializer = ProjectSerializer(startups, many=True)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
@permission_classes([AllowAny])
def project_detail(request, project_id):
    """
    API endpoint that returns detailed information about a specific project/startup.
    """
    try:
        startup = StartupDetail.objects.get(id=project_id)
        serializer = ProjectDetailSerializer(startup)
        return JsonResponse(serializer.data)
    except StartupDetail.DoesNotExist:
        return JsonResponse(
            {"error": f"Project with id {project_id} not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def user_detail(request, user_id):
    """
    API endpoint that returns information about a specific user.
    """
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return JsonResponse(serializer.data)
    except User.DoesNotExist:
        return JsonResponse(
            {"error": f"User with id {user_id} not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticatedNotRegularUser])
def project_views(request, user_id):
    """
    Returns the views of the user's projects for the last 6 months.
    This is a placeholder implementation.
    Restricted to authenticated users with roles other than regular users.
    Users can only access their own data unless they are admins.
    """
    # Check if user is accessing their own data or is an admin
    if str(request.user.id) != str(user_id) and request.user.role != 'admin':
        return Response({"error": "You do not have permission to access this data"},
                        status=status.HTTP_403_FORBIDDEN)

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

@api_view(['GET'])
@permission_classes([IsAuthenticatedNotRegularUser])
def project_engagement(request, user_id):
    """
    Returns the engagement rate for the user's projects.
    This is a placeholder implementation.
    Restricted to authenticated users with roles other than regular users.
    Users can only access their own data unless they are admins.
    """
    # Check if user is accessing their own data or is an admin
    if str(request.user.id) != str(user_id) and request.user.role != 'admin':
        return Response({"error": "You do not have permission to access this data"},
                        status=status.HTTP_403_FORBIDDEN)

    # Placeholder data
    data = {"rate": 75}

    serializer = ProjectEngagementSerializer(data)
    return Response(serializer.data)
