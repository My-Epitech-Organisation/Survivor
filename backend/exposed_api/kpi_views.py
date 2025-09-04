from authentication.models import CustomUser
from authentication.permissions import IsAdmin
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from admin_panel.models import Event, StartupDetail

from .models import SiteStatistics


@api_view(["GET"])
@permission_classes([IsAdmin])
def total_users(request):
    """
    API endpoint that returns the total number of users in the system.
    This endpoint requires admin privileges.
    """
    count = CustomUser.objects.count()
    return JsonResponse({"value": count})


@api_view(["GET"])
@permission_classes([IsAdmin])
def total_startups(request):
    """
    API endpoint that returns the total number of startups in the system.
    This endpoint requires admin privileges.
    """
    count = StartupDetail.objects.count()
    return JsonResponse({"value": count})


@api_view(["GET"])
@permission_classes([IsAdmin])
def total_events(request):
    """
    API endpoint that returns the total number of events in the system.
    This endpoint requires admin privileges.
    """
    count = Event.objects.count()
    return JsonResponse({"value": count})


@api_view(["GET"])
@permission_classes([IsAdmin])
def new_signups(request):
    """
    API endpoint that returns the number of new user registrations.
    This endpoint requires admin privileges.
    """
    today = timezone.now().date()
    stats, created = SiteStatistics.objects.get_or_create(date=today)
    return JsonResponse({"value": stats.new_signups})
