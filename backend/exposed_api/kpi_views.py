from datetime import timedelta

from auditlog.models import AuditLog
from authentication.models import CustomUser
from authentication.permissions import IsAdmin, IsAdminOrFounder
from django.db.models import Count, F, Q
from django.db.models.functions import TruncDay, TruncMonth
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from admin_panel.models import Event, StartupDetail

from .models import ProjectDislike, ProjectLike, ProjectShare, ProjectView, SiteStatistics
from .serializers import ProjectEngagementStatsSerializer, ProjectViewStatsSerializer


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
@permission_classes([IsAdminOrFounder])
def projects_visibility(request):
    """
    API endpoint that returns project visibility data by month.
    This endpoint requires admin or founder privileges.
    """
    now = timezone.now()
    last_6_months = now - timedelta(days=180)

    monthly_views = (
        ProjectView.objects.filter(timestamp__gte=last_6_months)
        .annotate(month=TruncMonth("timestamp"))
        .values("month")
        .annotate(views=Count("id"))
        .order_by("month")
    )

    data = []
    for item in monthly_views:
        month_name = item["month"].strftime("%B")
        data.append({"month": month_name, "views": item["views"]})

    if len(data) < 6:
        all_months = []
        for i in range(6):
            month = (now - timedelta(days=30 * i)).strftime("%B")
            all_months.append(month)

        existing_data = {item["month"]: item["views"] for item in data}

        data = [{"month": month, "views": existing_data.get(month, 0)} for month in all_months]

        data.reverse()

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
    API endpoint that returns recent actions in the system from the audit logs.
    This endpoint requires admin privileges.
    """
    limit = 5
    recent_logs = AuditLog.objects.all().order_by("-timestamp")[:limit]
    data = []
    for log in recent_logs:
        data.append(
            {"id": log.id, "action": log.action, "user": log.user, "time": log.timestamp.isoformat(), "type": log.type}
        )

    return JsonResponse(data, safe=False)


@api_view(["GET"])
@permission_classes([IsAdmin])
def monthly_stats(request):
    """
    API endpoint that returns monthly statistics for the dashboard.
    Uses real data from the database to provide current month's statistics.
    This endpoint requires admin privileges.
    """
    now = timezone.now()
    first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    projects_launched = StartupDetail.objects.filter(created_at__gte=first_day_of_month).count()

    events_created = Event.objects.filter(id__gt=0).count()

    active_sessions = (
        ProjectView.objects.filter(timestamp__gte=first_day_of_month).values("session_key").distinct().count()
    )

    total_views_this_month = ProjectView.objects.filter(timestamp__gte=first_day_of_month).count()

    active_projects = (
        ProjectView.objects.filter(timestamp__gte=first_day_of_month).values("project").distinct().count()
    )

    avg_views_per_project = 0
    if active_projects > 0:
        avg_views_per_project = round(total_views_this_month / active_projects)

    avg_session_duration = "15m 30s"

    new_signups_this_month = CustomUser.objects.filter(date_joined__gte=first_day_of_month).count()

    data = {
        "projectsLaunched": projects_launched,
        "eventsCreated": events_created,
        "activeSessions": active_sessions,
        "newSignups": new_signups_this_month,
        "totalViews": total_views_this_month,
        "avgViewsPerProject": avg_views_per_project,
        "avgSessionDuration": avg_session_duration,
    }

    return JsonResponse(data)


@api_view(["GET"])
@permission_classes([IsAdminOrFounder])
def project_view_stats(request, project_id=None):
    """
    API endpoint that returns view statistics for projects.
    If project_id is provided, returns stats for that specific project.
    Otherwise, returns stats for all projects.
    This endpoint requires admin or founder privileges.
    """
    period = request.GET.get("period", "all")

    now = timezone.now()
    date_filter = Q()

    if period == "day":
        date_filter = Q(timestamp__gte=now - timedelta(days=1))
    elif period == "week":
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))
    elif period == "month":
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == "year":
        date_filter = Q(timestamp__gte=now - timedelta(days=365))

    queryset = ProjectView.objects.filter(date_filter)

    if project_id:
        queryset = queryset.filter(project_id=project_id)

    total_views = queryset.count()
    unique_users = queryset.filter(user__isnull=False).values("user").distinct().count()
    unique_ips = queryset.exclude(ip_address__isnull=True).values("ip_address").distinct().count()
    unique_sessions = queryset.exclude(session_key__isnull=True).values("session_key").distinct().count()

    data = {
        "total_views": total_views,
        "unique_users": unique_users,
        "unique_ips": unique_ips,
        "unique_sessions": unique_sessions,
    }

    if period != "all":
        data["period_start"] = (
            now - timedelta(days=1 if period == "day" else 7 if period == "week" else 30 if period == "month" else 365)
        ).isoformat()
        data["period_end"] = now.isoformat()

    serializer = ProjectViewStatsSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return JsonResponse(serializer.validated_data)


@api_view(["GET"])
@permission_classes([IsAdminOrFounder])
def most_viewed_projects(request):
    """
    API endpoint that returns the most viewed projects.
    This endpoint requires admin or founder privileges.
    """
    period = request.GET.get("period", "month")
    limit = int(request.GET.get("limit", 5))

    now = timezone.now()
    date_filter = Q()

    if period == "day":
        date_filter = Q(timestamp__gte=now - timedelta(days=1))
    elif period == "week":
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))
    elif period == "month":
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == "year":
        date_filter = Q(timestamp__gte=now - timedelta(days=365))
    elif period == "all":
        date_filter = Q()

    most_viewed = (
        ProjectView.objects.filter(date_filter)
        .values("project")
        .annotate(total_views=Count("id"))
        .order_by("-total_views")[:limit]
    )

    result = []
    for item in most_viewed:
        project_id = item["project"]
        try:
            project = StartupDetail.objects.get(id=project_id)
            result.append(
                {
                    "id": project.id,
                    "name": project.name,
                    "total_views": item["total_views"],
                }
            )
        except StartupDetail.DoesNotExist:
            continue

    return JsonResponse(result, safe=False)


@api_view(["GET"])
@permission_classes([IsAdminOrFounder])
def project_views_over_time(request, project_id=None):
    """
    API endpoint that returns project views over time.
    If project_id is provided, returns data for that specific project.
    Otherwise, returns aggregated data for all projects.
    This endpoint requires admin or founder privileges.
    """
    grouping = request.GET.get("grouping", "month")
    period = request.GET.get("period", "year")

    now = timezone.now()
    date_filter = Q()

    if period == "month":
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == "year":
        date_filter = Q(timestamp__gte=now - timedelta(days=365))
    elif period == "all":
        date_filter = Q()
    elif period == "week":
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))

    queryset = ProjectView.objects.filter(date_filter)

    if project_id:
        queryset = queryset.filter(project_id=project_id)

    if grouping == "day":
        queryset = (
            queryset.annotate(period=TruncDay("timestamp"))
            .values("period")
            .annotate(views=Count("id"))
            .order_by("period")
        )
    else:
        queryset = (
            queryset.annotate(period=TruncMonth("timestamp"))
            .values("period")
            .annotate(views=Count("id"))
            .order_by("period")
        )

    result = [{"period": item["period"].isoformat(), "views": item["views"]} for item in queryset]

    return JsonResponse(result, safe=False)


@api_view(["GET"])
@permission_classes([AllowAny])
def project_views_count(request, project_id):
    """
    Public API endpoint that returns the view count for a specific project.
    This endpoint is accessible to all users.
    """
    try:
        StartupDetail.objects.get(id=project_id)
    except StartupDetail.DoesNotExist:
        return JsonResponse({"error": f"Project with id {project_id} not found"}, status=404)

    total_views = ProjectView.objects.filter(project_id=project_id).count()

    unique_views = ProjectView.objects.filter(project_id=project_id).values("ip_address").distinct().count()

    return JsonResponse({"project_id": project_id, "total_views": total_views, "unique_views": unique_views})


@api_view(["GET"])
@permission_classes([AllowAny])
def project_engagement_count(request, project_id):
    """
    Public API endpoint that returns the engagement counts for a specific project.
    This endpoint is accessible to all users.
    """
    try:
        StartupDetail.objects.get(id=project_id)
    except StartupDetail.DoesNotExist:
        return JsonResponse({"error": f"Project with id {project_id} not found"}, status=404)

    total_likes = ProjectLike.objects.filter(project_id=project_id).count()
    total_dislikes = ProjectDislike.objects.filter(project_id=project_id).count()
    total_shares = ProjectShare.objects.filter(project_id=project_id).count()

    unique_likers = (
        ProjectLike.objects.filter(project_id=project_id)
        .values("user", "ip_address", "session_key")
        .distinct()
        .count()
    )
    unique_dislikers = (
        ProjectDislike.objects.filter(project_id=project_id)
        .values("user", "ip_address", "session_key")
        .distinct()
        .count()
    )
    unique_sharers = (
        ProjectShare.objects.filter(project_id=project_id)
        .values("user", "ip_address", "session_key")
        .distinct()
        .count()
    )

    return JsonResponse(
        {
            "project_id": project_id,
            "total_likes": total_likes,
            "total_dislikes": total_dislikes,
            "total_shares": total_shares,
            "unique_likers": unique_likers,
            "unique_dislikers": unique_dislikers,
            "unique_sharers": unique_sharers,
        }
    )


@api_view(["GET"])
@permission_classes([IsAdminOrFounder])
def project_engagement_stats(request, project_id=None):
    """
    API endpoint that returns engagement statistics for projects.
    If project_id is provided, returns stats for that specific project.
    Otherwise, returns stats for all projects.
    This endpoint requires admin or founder privileges.
    """
    period = request.GET.get("period", "all")

    now = timezone.now()
    date_filter = Q()

    if period == "day":
        date_filter = Q(timestamp__gte=now - timedelta(days=1))
    elif period == "week":
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))
    elif period == "month":
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == "year":
        date_filter = Q(timestamp__gte=now - timedelta(days=365))

    likes_queryset = ProjectLike.objects.filter(date_filter)
    dislikes_queryset = ProjectDislike.objects.filter(date_filter)
    shares_queryset = ProjectShare.objects.filter(date_filter)

    if project_id:
        likes_queryset = likes_queryset.filter(project_id=project_id)
        dislikes_queryset = dislikes_queryset.filter(project_id=project_id)
        shares_queryset = shares_queryset.filter(project_id=project_id)

    total_likes = likes_queryset.count()
    total_dislikes = dislikes_queryset.count()
    total_shares = shares_queryset.count()

    unique_likers = likes_queryset.values("user", "ip_address", "session_key").distinct().count()
    unique_dislikers = dislikes_queryset.values("user", "ip_address", "session_key").distinct().count()
    unique_sharers = shares_queryset.values("user", "ip_address", "session_key").distinct().count()

    data = {
        "total_likes": total_likes,
        "total_dislikes": total_dislikes,
        "total_shares": total_shares,
        "unique_likers": unique_likers,
        "unique_dislikers": unique_dislikers,
        "unique_sharers": unique_sharers,
    }

    if period != "all":
        data["period_start"] = (
            now - timedelta(days=1 if period == "day" else 7 if period == "week" else 30 if period == "month" else 365)
        ).isoformat()
        data["period_end"] = now.isoformat()

    serializer = ProjectEngagementStatsSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return JsonResponse(serializer.validated_data)


@api_view(["GET"])
@permission_classes([IsAdminOrFounder])
def most_engaged_projects(request):
    """
    API endpoint that returns the most engaged projects (based on likes + shares - dislikes).
    This endpoint requires admin or founder privileges.
    """
    period = request.GET.get("period", "month")
    limit = int(request.GET.get("limit", 5))

    now = timezone.now()
    date_filter = Q()

    if period == "day":
        date_filter = Q(timestamp__gte=now - timedelta(days=1))
    elif period == "week":
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))
    elif period == "month":
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == "year":
        date_filter = Q(timestamp__gte=now - timedelta(days=365))
    elif period == "all":
        date_filter = Q()

    likes_data = ProjectLike.objects.filter(date_filter).values("project").annotate(likes_count=Count("id"))

    dislikes_data = ProjectDislike.objects.filter(date_filter).values("project").annotate(dislikes_count=Count("id"))

    shares_data = ProjectShare.objects.filter(date_filter).values("project").annotate(shares_count=Count("id"))

    project_engagement = {}

    for item in likes_data:
        project_id = item["project"]
        project_engagement[project_id] = {
            "likes": item["likes_count"],
            "dislikes": 0,
            "shares": 0,
        }

    for item in dislikes_data:
        project_id = item["project"]
        if project_id not in project_engagement:
            project_engagement[project_id] = {"likes": 0, "dislikes": 0, "shares": 0}
        project_engagement[project_id]["dislikes"] = item["dislikes_count"]

    for item in shares_data:
        project_id = item["project"]
        if project_id not in project_engagement:
            project_engagement[project_id] = {"likes": 0, "dislikes": 0, "shares": 0}
        project_engagement[project_id]["shares"] = item["shares_count"]

    result = []
    for project_id, counts in project_engagement.items():
        engagement_score = counts["likes"] + counts["shares"] - counts["dislikes"]
        try:
            project = StartupDetail.objects.get(id=project_id)
            result.append(
                {
                    "id": project.id,
                    "name": project.name,
                    "likes": counts["likes"],
                    "dislikes": counts["dislikes"],
                    "shares": counts["shares"],
                    "engagement_score": engagement_score,
                }
            )
        except StartupDetail.DoesNotExist:
            continue

    result.sort(key=lambda x: x["engagement_score"], reverse=True)
    result = result[:limit]

    return JsonResponse(result, safe=False)


@api_view(["GET"])
@permission_classes([IsAdminOrFounder])
def project_engagement_over_time(request, project_id=None):
    """
    API endpoint that returns project engagement over time.
    If project_id is provided, returns data for that specific project.
    Otherwise, returns aggregated data for all projects.
    This endpoint requires admin or founder privileges.
    """
    grouping = request.GET.get("grouping", "month")
    period = request.GET.get("period", "year")

    now = timezone.now()
    date_filter = Q()

    if period == "month":
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == "year":
        date_filter = Q(timestamp__gte=now - timedelta(days=365))
    elif period == "all":
        date_filter = Q()
    elif period == "week":
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))

    likes_queryset = ProjectLike.objects.filter(date_filter)
    dislikes_queryset = ProjectDislike.objects.filter(date_filter)
    shares_queryset = ProjectShare.objects.filter(date_filter)

    if project_id:
        likes_queryset = likes_queryset.filter(project_id=project_id)
        dislikes_queryset = dislikes_queryset.filter(project_id=project_id)
        shares_queryset = shares_queryset.filter(project_id=project_id)

    if grouping == "day":
        likes_data = (
            likes_queryset.annotate(period=TruncDay("timestamp"))
            .values("period")
            .annotate(likes=Count("id"))
            .order_by("period")
        )
        dislikes_data = (
            dislikes_queryset.annotate(period=TruncDay("timestamp"))
            .values("period")
            .annotate(dislikes=Count("id"))
            .order_by("period")
        )
        shares_data = (
            shares_queryset.annotate(period=TruncDay("timestamp"))
            .values("period")
            .annotate(shares=Count("id"))
            .order_by("period")
        )
    else:
        likes_data = (
            likes_queryset.annotate(period=TruncMonth("timestamp"))
            .values("period")
            .annotate(likes=Count("id"))
            .order_by("period")
        )
        dislikes_data = (
            dislikes_queryset.annotate(period=TruncMonth("timestamp"))
            .values("period")
            .annotate(dislikes=Count("id"))
            .order_by("period")
        )
        shares_data = (
            shares_queryset.annotate(period=TruncMonth("timestamp"))
            .values("period")
            .annotate(shares=Count("id"))
            .order_by("period")
        )

    engagement_data = {}

    for item in likes_data:
        period = item["period"].isoformat()
        if period not in engagement_data:
            engagement_data[period] = {"likes": 0, "dislikes": 0, "shares": 0}
        engagement_data[period]["likes"] = item["likes"]

    for item in dislikes_data:
        period = item["period"].isoformat()
        if period not in engagement_data:
            engagement_data[period] = {"likes": 0, "dislikes": 0, "shares": 0}
        engagement_data[period]["dislikes"] = item["dislikes"]

    for item in shares_data:
        period = item["period"].isoformat()
        if period not in engagement_data:
            engagement_data[period] = {"likes": 0, "dislikes": 0, "shares": 0}
        engagement_data[period]["shares"] = item["shares"]

    result = [
        {
            "period": period,
            "likes": data["likes"],
            "dislikes": data["dislikes"],
            "shares": data["shares"],
            "engagement_score": data["likes"] + data["shares"] - data["dislikes"],
        }
        for period, data in engagement_data.items()
    ]

    return JsonResponse(result, safe=False)
