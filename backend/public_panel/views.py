from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from admin_panel.models import StartupDetail
from .serializers import ProjectSerializer, ProjectDetailSerializer

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
