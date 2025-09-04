from authentication.permissions import IsAdmin
from django.http import JsonResponse
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Investor

from .investor_serializers import InvestorCrudSerializer


class InvestorDetailView(APIView):
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
            investors = Investor.objects.all()
            serializer = InvestorCrudSerializer(investors, many=True)
            return JsonResponse(serializer.data, safe=False)
        try:
            investor = Investor.objects.get(id=_id)
            serializer = InvestorCrudSerializer(investor)
            return JsonResponse(serializer.data)
        except Investor.DoesNotExist:
            return JsonResponse({"error": f"Investor with id {_id} not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Handle POST requests - admin only"""
        serializer = InvestorCrudSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, _id):
        """Handle PUT requests - admin only"""
        investor = get_object_or_404(Investor, id=_id)
        serializer = InvestorCrudSerializer(investor, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, _id):
        """Handle DELETE requests - admin only"""
        investor = get_object_or_404(Investor, id=_id)
        investor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
