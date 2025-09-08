from authentication.models import CustomUser
from authentication.permissions import IsAdmin
from django.db.models import Q
from django.http import JsonResponse
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Founder

from .founder_serializers import FounderCrudSerializer, FounderDetailSerializer


class FounderDetailView(APIView):
    def get_permissions(self):
        """
        Override to return different permissions based on HTTP method.
        GET requests for individual founders are allowed for everyone,
        but listing with filtering and other operations require admin.
        """
        if self.request.method == "GET" and self.kwargs.get("_id") is not None:
            return [AllowAny()]
        return [IsAdmin()]

    def get(self, request, _id=None):
        """
        Handle GET requests.
        - For specific founder (_id provided): accessible to all users
        - For listing all founders (no _id): admin only, with optional filtering
        """
        if _id is None:
            founder_available = request.query_params.get("founder_available", "false").lower() == "true"

            founders_queryset = Founder.objects.all()

            if founder_available:
                linked_founder_ids = CustomUser.objects.filter(founder_id__isnull=False).values_list(
                    "founder_id", flat=True
                )

                founders_queryset = founders_queryset.exclude(id__in=linked_founder_ids)

            serializer = FounderDetailSerializer(founders_queryset, many=True)
            return Response(serializer.data)

        try:
            founder = Founder.objects.get(id=_id)
            serializer = FounderDetailSerializer(founder)
            return Response(serializer.data)
        except Founder.DoesNotExist:
            return Response({"error": f"Founder with id {_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Handle POST requests - admin only"""
        serializer = FounderCrudSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, _id):
        """Handle PUT requests - admin only"""
        founder = get_object_or_404(Founder, id=_id)
        serializer = FounderCrudSerializer(founder, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, _id):
        """Handle DELETE requests - admin only"""
        founder = get_object_or_404(Founder, id=_id)
        founder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
