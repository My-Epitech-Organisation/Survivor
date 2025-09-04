from authentication.models import CustomUser
from authentication.permissions import IsAdmin
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

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


@api_view(["GET"])
@permission_classes([IsAdmin])
def projects_visibility(request):
    """
    API endpoint that returns project visibility data by month.
    This is a placeholder implementation.
    This endpoint requires admin privileges.
    """
    # Placeholder data for project visibility by month
    # TODO: Replace with actual data retrieval logic
    data = [
        {"month": "January", "views": 120},
        {"month": "February", "views": 145},
        {"month": "March", "views": 210},
        {"month": "April", "views": 195},
        {"month": "May", "views": 260},
        {"month": "June", "views": 320},
    ]

    return JsonResponse(data, safe=False)


@api_view(["GET"])
@permission_classes([IsAdmin])
def users_connected_ratio(request):
    """
    API endpoint that returns the ratio of currently connected users to total users.
    This endpoint requires admin privileges.
    """
    total_users_count = CustomUser.objects.count()

    if total_users_count == 0:
        return JsonResponse({"rate": 0})

    current_time = timezone.now()
    valid_tokens = OutstandingToken.objects.filter(expires_at__gt=current_time)

    blacklisted_tokens = BlacklistedToken.objects.all().values_list("token_id", flat=True)
    active_tokens = valid_tokens.exclude(id__in=blacklisted_tokens)

    connected_users_count = active_tokens.values("user").distinct().count()
    ratio = (connected_users_count / total_users_count) * 100
    return JsonResponse({"rate": int(ratio)})


@api_view(["GET"])
@permission_classes([IsAdmin])
def recent_actions(request):
    """
    API endpoint that returns recent actions in the system.
    This is a placeholder implementation.
    This endpoint requires admin privileges.
    """
    # Placeholder data for recent actions
    # TODO: Replace with actual data retrieval logic
    data = [
        {
            "id": 1,
            "action": "Created new project",
            "user": "john.doe@example.com",
            "time": "2025-09-04T10:23:15Z",
            "type": "project",
        },
        {
            "id": 2,
            "action": "Updated profile",
            "user": "jane.smith@example.com",
            "time": "2025-09-04T09:45:30Z",
            "type": "user",
        },
        {
            "id": 3,
            "action": "Added investor",
            "user": "admin@jeb-incubator.com",
            "time": "2025-09-03T16:12:45Z",
            "type": "investor",
        },
        {
            "id": 4,
            "action": "Created event",
            "user": "events@jeb-incubator.com",
            "time": "2025-09-03T14:05:22Z",
            "type": "event",
        },
        {
            "id": 5,
            "action": "Published news",
            "user": "media@jeb-incubator.com",
            "time": "2025-09-02T11:30:00Z",
            "type": "news",
        },
    ]

    return JsonResponse(data, safe=False)


@api_view(["GET"])
@permission_classes([IsAdmin])
def monthly_stats(request):
    """
    API endpoint that returns monthly statistics for the dashboard.
    This is a placeholder implementation.
    This endpoint requires admin privileges.
    """
    # Placeholder data for monthly statistics
    # TODO: Replace with actual data retrieval logic
    data = {
        "projectsLaunched": 8,
        "eventsCreated": 12,
        "activeSessions": 145,
        "supportTickets": 23,
        "avgSessionDuration": "24m 30s",
    }

    return JsonResponse(data)
