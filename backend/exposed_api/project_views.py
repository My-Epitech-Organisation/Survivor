from auditlog.models import AuditLog
from authentication.permissions import IsAdmin
from django.http import JsonResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Founder, StartupDetail

from .serializers import ProjectDetailGetSerializer, ProjectDetailSerializer, ProjectSerializer
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

        serializer = ProjectDetailGetSerializer(projects, many=True)

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
        GET requests are allowed for everyone,
        PUT requests require authentication (handled by custom logic in put method),
        POST and DELETE require admin.
        """
        if self.request.method == "GET":
            return [AllowAny()]
        if self.request.method == "PUT":
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get(self, request, _id=None):
        """Handle GET requests - accessible to all users"""
        if _id is None:
            startups = StartupDetail.objects.all()
            serializer = ProjectSerializer(startups, many=True)
            return JsonResponse(serializer.data, safe=False)
        try:
            startup = StartupDetail.objects.get(id=_id)
            serializer = ProjectDetailGetSerializer(startup)

            record_project_view(request, _id)

            return JsonResponse(serializer.data)
        except StartupDetail.DoesNotExist:
            return JsonResponse({"error": f"Project with id {_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Handle POST requests - admin only"""
        try:
            highest_id = StartupDetail.objects.all().order_by("-id").first()
            new_id = 1 if highest_id is None else highest_id.id + 1

            request_data = request.data.copy()
            current_date = timezone.now().strftime("%Y-%m-%d")

            if "ProjectCreatedAt" not in request_data:
                request_data["ProjectCreatedAt"] = current_date

            serializer = ProjectDetailSerializer(data=request_data, context={"request": request})
            if serializer.is_valid():
                project = serializer.save(id=new_id)
                AuditLog.objects.create(
                    action=f"New project created: {project.name}",
                    user=request.user.name,
                    type="project",
                )
                return Response(ProjectDetailSerializer(project).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, _id):
        """Handle PUT requests - admin or project founders only"""
        project = get_object_or_404(StartupDetail, id=_id)

        # Vérifier si l'utilisateur est un admin
        is_admin = hasattr(request.user, "role") and request.user.role == "admin"
        is_founder = False

        # Récupérer tous les IDs des fondateurs du projet
        project_founder_ids = list(project.founders.values_list("id", flat=True))

        # Vérifier si l'utilisateur est un fondateur de ce projet
        if hasattr(request.user, "founder_id") and request.user.founder_id:
            founder_id = request.user.founder_id
            is_founder = founder_id in project_founder_ids

        # Vérifier si le rôle de l'utilisateur est fondateur
        is_founder_role = hasattr(request.user, "role") and request.user.role == "founder"

        # Vérifier si le projet n'a pas de fondateurs (projet orphelin)
        is_orphan_project = len(project_founder_ids) == 0

        # Définir la politique d'autorisation:
        # 1. Les administrateurs peuvent tout modifier
        # 2. Les fondateurs peuvent modifier les projets auxquels ils sont associés
        # 3. Les utilisateurs avec le rôle "founder" peuvent s'approprier des projets orphelins
        has_permission = is_admin or is_founder or (is_founder_role and is_orphan_project)

        if not has_permission:
            return Response(
                {
                    "error": "You don't have permission to edit this project. Only admins and project founders can edit projects."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Vérifier si c'est un fondateur qui s'approprie un projet orphelin
        is_founder_claiming_orphan = (
            is_founder_role and is_orphan_project and hasattr(request.user, "founder_id") and request.user.founder_id
        )

        # Si l'utilisateur revendique un projet orphelin, assurons-nous qu'il est ajouté comme fondateur
        if is_founder_claiming_orphan:
            # Créer une copie des données de la requête
            request_data = request.data.copy() if hasattr(request, "data") else {}

            # S'assurer que ProjectFounders existe et contient au moins l'ID du fondateur actuel
            founder_id = request.user.founder_id

            # Chercher le fondateur dans la base de données
            try:
                founder = Founder.objects.get(id=founder_id)
                # Créer ou mettre à jour les données de fondateurs dans la requête
                if not request_data.get("ProjectFounders"):
                    request_data["ProjectFounders"] = []

                # Ajouter le fondateur actuel s'il n'est pas déjà présent
                founder_data = {"FounderID": founder.id, "FounderName": founder.name, "FounderStartupID": project.id}

                # Vérifier si le fondateur est déjà dans la liste
                founder_exists = False
                for existing_founder in request_data.get("ProjectFounders", []):
                    if existing_founder.get("FounderID") == founder.id:
                        founder_exists = True
                        break

                if not founder_exists:
                    request_data["ProjectFounders"].append(founder_data)

                serializer = ProjectDetailSerializer(
                    project, data=request_data, partial=True, context={"request": request}
                )
            except Founder.DoesNotExist:

                serializer = ProjectDetailSerializer(
                    project, data=request.data, partial=True, context={"request": request}
                )
        else:
            serializer = ProjectDetailSerializer(
                project, data=request.data, partial=True, context={"request": request}
            )

        if serializer.is_valid():
            serializer.save()
            AuditLog.objects.create(
                action=f"Project updated: {serializer.instance.name}",
                user=request.user.name,
                type="project",
            )
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, _id):
        """Handle DELETE requests - admin only"""
        project = get_object_or_404(StartupDetail, id=_id)
        project_name = project.name
        project.delete()
        AuditLog.objects.create(
            action=f"Project deleted: {project_name}",
            user=request.user.name,
            type="project",
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
