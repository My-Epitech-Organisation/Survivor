from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from admin_panel.models import StartupDetail
from .serializers import ProjectSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def projects_list(request):
    """
    API endpoint that returns a list of all projects/startups.
    """
    startups = StartupDetail.objects.all()
    serializer = ProjectSerializer(startups, many=True)
    return JsonResponse(serializer.data, safe=False)
