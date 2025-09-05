from authentication.models import CustomUser
from authentication.permissions import IsAdmin
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Count, F, Q
from django.db.models.functions import TruncMonth, TruncDay
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from datetime import timedelta

from admin_panel.models import Event, StartupDetail

from .models import SiteStatistics, ProjectView
from .serializers import ProjectViewStatsSerializer


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
    This endpoint requires admin privileges.
    """
    # Get real project visibility data from the database
    # Group by month and count views
    now = timezone.now()
    last_6_months = now - timedelta(days=180)

    monthly_views = (
        ProjectView.objects.filter(timestamp__gte=last_6_months)
        .annotate(month=TruncMonth('timestamp'))
        .values('month')
        .annotate(views=Count('id'))
        .order_by('month')
    )

    # Format the data for the frontend
    data = []
    for item in monthly_views:
        month_name = item['month'].strftime('%B')  # Format as month name (e.g., January)
        data.append({
            "month": month_name,
            "views": item['views']
        })

    # If we have less than 6 months of data, fill in the missing months with zeros
    if len(data) < 6:
        all_months = []
        for i in range(6):
            month = (now - timedelta(days=30 * i)).strftime('%B')
            all_months.append(month)

        # Create a dict of existing data
        existing_data = {item['month']: item['views'] for item in data}

        # Create the complete data set
        data = [
            {"month": month, "views": existing_data.get(month, 0)}
            for month in all_months
        ]

        # Reverse to get chronological order
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


@api_view(["GET"])
@permission_classes([IsAdmin])
def project_view_stats(request, project_id=None):
    """
    API endpoint that returns view statistics for projects.
    If project_id is provided, returns stats for that specific project.
    Otherwise, returns stats for all projects.
    This endpoint requires admin privileges.
    """
    # Get time period from query parameters, default to all time
    period = request.GET.get('period', 'all')

    # Set up the date filter based on the period
    now = timezone.now()
    date_filter = Q()

    if period == 'day':
        date_filter = Q(timestamp__gte=now - timedelta(days=1))
    elif period == 'week':
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))
    elif period == 'month':
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == 'year':
        date_filter = Q(timestamp__gte=now - timedelta(days=365))

    # Base queryset
    queryset = ProjectView.objects.filter(date_filter)

    # Filter by project if project_id is provided
    if project_id:
        queryset = queryset.filter(project_id=project_id)

    # Calculate statistics
    total_views = queryset.count()
    unique_users = queryset.filter(user__isnull=False).values('user').distinct().count()
    unique_ips = queryset.exclude(ip_address__isnull=True).values('ip_address').distinct().count()
    unique_sessions = queryset.exclude(session_key__isnull=True).values('session_key').distinct().count()

    # Create response data
    data = {
        'total_views': total_views,
        'unique_users': unique_users,
        'unique_ips': unique_ips,
        'unique_sessions': unique_sessions,
    }

    # Add period info if filtering by period
    if period != 'all':
        data['period_start'] = (now - timedelta(
            days=1 if period == 'day' else
            7 if period == 'week' else
            30 if period == 'month' else
            365
        )).isoformat()
        data['period_end'] = now.isoformat()

    # Serialize and return
    serializer = ProjectViewStatsSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    return JsonResponse(serializer.validated_data)


@api_view(["GET"])
@permission_classes([IsAdmin])
def most_viewed_projects(request):
    """
    API endpoint that returns the most viewed projects.
    This endpoint requires admin privileges.
    """
    # Get time period from query parameters, default to month
    period = request.GET.get('period', 'month')
    limit = int(request.GET.get('limit', 5))

    # Set up the date filter based on the period
    now = timezone.now()
    date_filter = Q()

    if period == 'day':
        date_filter = Q(timestamp__gte=now - timedelta(days=1))
    elif period == 'week':
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))
    elif period == 'month':
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == 'year':
        date_filter = Q(timestamp__gte=now - timedelta(days=365))
    elif period == 'all':
        date_filter = Q()

    # Get the most viewed projects
    most_viewed = (
        ProjectView.objects.filter(date_filter)
        .values('project')
        .annotate(total_views=Count('id'))
        .order_by('-total_views')[:limit]
    )

    # Fetch project details
    result = []
    for item in most_viewed:
        project_id = item['project']
        try:
            project = StartupDetail.objects.get(id=project_id)
            result.append({
                'id': project.id,
                'name': project.name,
                'total_views': item['total_views'],
                # You can add more project details here as needed
            })
        except StartupDetail.DoesNotExist:
            # Skip projects that no longer exist
            continue

    return JsonResponse(result, safe=False)


@api_view(["GET"])
@permission_classes([IsAdmin])
def project_views_over_time(request, project_id=None):
    """
    API endpoint that returns project views over time.
    If project_id is provided, returns data for that specific project.
    Otherwise, returns aggregated data for all projects.
    This endpoint requires admin privileges.
    """
    # Get grouping from query parameters, default to month
    grouping = request.GET.get('grouping', 'month')
    period = request.GET.get('period', 'year')

    # Set up the date filter based on the period
    now = timezone.now()
    date_filter = Q()

    if period == 'month':
        date_filter = Q(timestamp__gte=now - timedelta(days=30))
    elif period == 'year':
        date_filter = Q(timestamp__gte=now - timedelta(days=365))
    elif period == 'all':
        date_filter = Q()
    elif period == 'week':
        date_filter = Q(timestamp__gte=now - timedelta(weeks=1))

    # Base queryset
    queryset = ProjectView.objects.filter(date_filter)

    # Filter by project if project_id is provided
    if project_id:
        queryset = queryset.filter(project_id=project_id)

    # Group by time period
    if grouping == 'day':
        queryset = (
            queryset
            .annotate(period=TruncDay('timestamp'))
            .values('period')
            .annotate(views=Count('id'))
            .order_by('period')
        )
    else:  # Default to month
        queryset = (
            queryset
            .annotate(period=TruncMonth('timestamp'))
            .values('period')
            .annotate(views=Count('id'))
            .order_by('period')
        )

    # Format the result
    result = [
        {
            'period': item['period'].isoformat(),
            'views': item['views']
        }
        for item in queryset
    ]

    return JsonResponse(result, safe=False)


@api_view(["GET"])
@permission_classes([AllowAny])
def project_views_count(request, project_id):
    """
    Public API endpoint that returns the view count for a specific project.
    This endpoint is accessible to all users.
    """
    # Check if the project exists
    try:
        StartupDetail.objects.get(id=project_id)
    except StartupDetail.DoesNotExist:
        return JsonResponse({"error": f"Project with id {project_id} not found"}, status=404)

    # Get total views
    total_views = ProjectView.objects.filter(project_id=project_id).count()

    # You could also calculate unique views if needed
    unique_views = ProjectView.objects.filter(project_id=project_id).values('ip_address').distinct().count()

    return JsonResponse({
        "project_id": project_id,
        "total_views": total_views,
        "unique_views": unique_views
    })
