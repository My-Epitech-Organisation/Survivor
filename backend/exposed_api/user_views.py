from authentication.models import CustomUser
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from authentication.serializers import UserSerializer as AuthUserSerializer
from .serializers import UserSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get currently authenticated user details
    """
    serializer = AuthUserSerializer(request.user)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def user_detail(request, user_id):
    """
    API endpoint that returns information about a specific user.
    """
    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": f"User with id {user_id} not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data)
