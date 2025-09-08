from authentication.models import CustomUser
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser

from init.utils import fetch_and_create_news

from .models import Event, NewsDetail, StartupDetail
from .serializers import EventSerializer, NewsDetailSerializer, StartupDetailSerializer


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_panel_home(request):
    """
    Main view of the admin panel.
    This view will only be accessible to admin users.
    """
    return JsonResponse({"message": "Welcome to the admin panel", "status": "success"})


@api_view(["GET"])
@permission_classes([AllowAny])
def fetch_news_temp(request):
    """
    Temporary view to fetch news data from JEB API.
    This view will fetch and create news data in the database.
    """
    fetch_and_create_news()
    return JsonResponse({"message": "News data fetch initiated", "status": "success"})
