from authentication.models import CustomUser
from authentication.permissions import IsAdmin, IsNotRegularUser
from django.conf import settings
from django.http import JsonResponse
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Founder

from .founder_serializers import FounderDetailSerializer
from .serializers import InvestorUserSerializer, UserSerializer


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
            if image_path.startswith("/"):
                image_path = image_path[1:]
            return f"{settings.MEDIA_URL.rstrip('/')}/{image_path}"
        return None


class AdminUserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        image_path = rep.get("userImage")
        if image_path:
            if image_path.startswith("/"):
                image_path = image_path[1:]
            rep["userImage"] = f"{settings.MEDIA_URL.rstrip('/')}/{image_path}"
        else:
            rep["userImage"] = None
        return rep

    """
    Serializer for administrative management of users
    """

    name = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    founder = serializers.SerializerMethodField()
    investor = serializers.SerializerMethodField()
    userImage = serializers.CharField(source="image", required=False, allow_blank=True, allow_null=True)

    def validate_userImage(self, value):
        if value in [None, ""]:
            return None
        prefix = "/api/media/"
        if isinstance(value, str) and value.startswith(prefix):
            return value[len(prefix) :]
        return value

    is_active = serializers.BooleanField()

    founder_id = serializers.IntegerField(required=False, allow_null=True)
    investor_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "name",
            "email",
            "role",
            "founder",
            "founder_id",
            "investor",
            "investor_id",
            "userImage",
            "is_active",
        ]

    def get_investor(self, obj):
        if obj.role == "investor" and getattr(obj, "investor_id", None):
            try:
                from admin_panel.models import Investor

                investor = Investor.objects.get(id=obj.investor_id)
                return {
                    "id": investor.id,
                    "name": getattr(investor, "name", None),
                    "legal_status": getattr(investor, "legal_status", None),
                    "address": getattr(investor, "address", None),
                    "email": getattr(investor, "email", None),
                    "phone": getattr(investor, "phone", None),
                    "created_at": getattr(investor, "created_at", None),
                    "description": getattr(investor, "description", None),
                    "investor_type": getattr(investor, "investor_type", None),
                    "investment_focus": getattr(investor, "investment_focus", None),
                }
            except Exception:
                pass
        return None

    def get_founder(self, obj):
        if obj.role == "founder" and obj.founder_id:
            try:
                founder = Founder.objects.get(id=obj.founder_id)
                return FounderDetailSerializer(founder).data
            except Founder.DoesNotExist:
                pass
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
    def post(self, request):
        """
        Create a new user (admin only).
        """
        data = request.data.copy()
        founder = data.get("founder")
        investor = data.get("investor")
        if founder is None:
            data["founder_id"] = None
        elif isinstance(founder, dict) and founder.get("FounderID") is not None:
            data["founder_id"] = founder["FounderID"]
            data["investor_id"] = None
        if investor is None:
            data["investor_id"] = None
        elif isinstance(investor, dict) and investor.get("id") is not None:
            data["investor_id"] = investor["id"]
            data["founder_id"] = None
        serializer = AdminUserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

        data = request.data.copy()
        founder = data.get("founder")
        investor = data.get("investor")
        if founder is None:
            data["founder_id"] = None
        elif isinstance(founder, dict) and founder.get("FounderID") is not None:
            data["founder_id"] = founder["FounderID"]
            data["investor_id"] = None
        if investor is None:
            data["investor_id"] = None
        elif isinstance(investor, dict) and investor.get("id") is not None:
            data["investor_id"] = investor["id"]
            data["founder_id"] = None
        serializer = AdminUserSerializer(user, data=data, partial=True)
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


class InvestorUsersView(APIView):
    """
    Returns all users that are linked to an investor (investor_id is not null).
    """

    permission_classes = [IsNotRegularUser]

    def get(self, request):
        users = CustomUser.objects.filter(investor_id__isnull=False)
        serializer = InvestorUserSerializer(users, many=True)
        return Response(serializer.data)


class FounderUsersView(APIView):
    """
    Returns all users that are linked to a founder (founder_id is not null).
    """

    permission_classes = [IsNotRegularUser]

    def get(self, request):
        users = CustomUser.objects.filter(founder_id__isnull=False)
        serializer = InvestorUserSerializer(users, many=True)
        return Response(serializer.data)
