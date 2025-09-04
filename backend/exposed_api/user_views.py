from authentication.models import CustomUser
from django.conf import settings
from django.http import JsonResponse
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

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
            return f"{settings.MEDIA_URL}{obj.image}"
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
