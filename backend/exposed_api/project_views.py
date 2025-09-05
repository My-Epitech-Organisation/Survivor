from authentication.permissions import IsAdmin
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Founder, StartupDetail

from .serializers import ProjectDetailSerializer, ProjectSerializer
from .views import record_project_view


@api_view(["GET"])
@permission_classes([AllowAny])
def projects_by_founder(request, founder_id):
    """
    Get all projects associated with a specific founder
    """
    try:
        founder = Founder.objects.get(id=founder_id)
        projects = StartupDetail.objects.filter(founders=founder)

        serializer = ProjectDetailSerializer(projects, many=True)

        # If only one project is returned, record the view
        if len(projects) == 1:
            record_project_view(request, projects[0].id)

        return JsonResponse(serializer.data, safe=False)
    except Founder.DoesNotExist:
        return JsonResponse({"error": f"Founder with id {founder_id} not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectDetailView(APIView):
    def get_permissions(self):
        """
        Override to return different permissions based on HTTP method.
        GET requests are allowed for everyone, but POST, PUT, DELETE require admin.
        """
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get(self, request, _id=None):
        """Handle GET requests - accessible to all users"""
        if _id is None:
            startups = StartupDetail.objects.all()
            serializer = ProjectSerializer(startups, many=True)
            return JsonResponse(serializer.data, safe=False)
        try:
            startup = StartupDetail.objects.get(id=_id)

            # Record the project view
            record_project_view(request, _id)

            serializer = ProjectDetailSerializer(startup)
            return JsonResponse(serializer.data)
        except StartupDetail.DoesNotExist:
            return JsonResponse({"error": f"Project with id {_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Handle POST requests - admin only"""
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, _id):
        """Handle PUT requests - admin only"""
        project = get_object_or_404(StartupDetail, id=_id)
        serializer = ProjectSerializer(project, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, _id):
        """Handle DELETE requests - admin only"""
        project = get_object_or_404(StartupDetail, id=_id)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
