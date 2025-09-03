from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import get_object_or_404

from admin_panel.models import StartupDetail
from .serializers import ProjectSerializer, ProjectDetailSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class ProjectDetailView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, id):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        project = get_object_or_404(StartupDetail, id=id)
        serializer = ProjectSerializer(project, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        project = get_object_or_404(StartupDetail, id=id)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# GET views for projects (public)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse

@api_view(["GET"])
@permission_classes([AllowAny])
def projects_list(request):
    startups = StartupDetail.objects.all()
    serializer = ProjectSerializer(startups, many=True)
    return JsonResponse(serializer.data, safe=False)

@api_view(["GET"])
@permission_classes([AllowAny])
def project_detail(request, project_id):
    try:
        startup = StartupDetail.objects.get(id=project_id)
        serializer = ProjectDetailSerializer(startup)
        return JsonResponse(serializer.data)
    except StartupDetail.DoesNotExist:
        return JsonResponse({"error": f"Project with id {project_id} not found"}, status=status.HTTP_404_NOT_FOUND)
