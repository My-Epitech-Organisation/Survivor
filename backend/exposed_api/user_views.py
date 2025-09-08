from authentication.models import CustomUser
from authentication.permissions import IsAdmin
from django.conf import settings
from django.http import JsonResponse
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Founder

from .founder_serializers import FounderDetailSerializer
from .serializers import UserSerializer


class CurrentUserSerializer(serializers.ModelSerializer):
    """
    Serializer for the current authenticated user
    """

    role = serializers.CharField()
    startupId = serializers.SerializerMethodField()
    founderId = serializers.IntegerField(source="founder_id", allow_null=True)
    userImage = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["name", "email", "role", "id", "founderId", "startupId", "userImage"]

    def get_startupId(self, obj):
        if obj.role == "founder" and obj.founder_id:
            try:
                from admin_panel.models import Founder

                founder = Founder.objects.filter(id=obj.founder_id).first()
                if founder:
                    return founder.startup_id
            except Exception:
                pass
        return None

    def get_userImage(self, obj):
        if obj.image:
            image_path = obj.image
            if image_path.startswith('/'):
                image_path = image_path[1:]
            return f"{settings.MEDIA_URL.rstrip('/')}/{image_path}"
        return None


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for administrative management of users
    """

    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    founder = serializers.SerializerMethodField()
    userImage = serializers.SerializerMethodField()
    is_active = serializers.BooleanField()

    class Meta:
        model = CustomUser
        fields = ["id", "name", "email", "role", "founder", "userImage", "is_active"]

    def get_founder(self, obj):
        if obj.role == "founder" and obj.founder_id:
            try:
                founder = Founder.objects.get(id=obj.founder_id)
                return FounderDetailSerializer(founder).data
            except Founder.DoesNotExist:
                pass
        return None

    def get_userImage(self, obj):
        if obj.image:
            # Make sure the path doesn't have double slashes
            image_path = obj.image
            if image_path.startswith('/'):
                image_path = image_path[1:]
            return f"{settings.MEDIA_URL.rstrip('/')}/{image_path}"
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get currently authenticated user details in the required format
    """
    serializer = CurrentUserSerializer(request.user)
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


class AdminUserView(APIView):
    """
    API endpoint for administrative user management.
    """

    permission_classes = [IsAdmin]

    def get(self, request, user_id=None):
        """
        List all users or get details for a specific user.
        """
        if user_id is None:
            users = CustomUser.objects.all()
            serializer = AdminUserSerializer(users, many=True)
            return Response(serializer.data)

        try:
            user = CustomUser.objects.get(id=user_id)
            serializer = AdminUserSerializer(user)
            return Response(serializer.data)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User with id {user_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        """
        Update an existing user.
        """
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User with id {user_id} not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        """
        Delete a user.
        """
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": f"User with id {user_id} not found"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
