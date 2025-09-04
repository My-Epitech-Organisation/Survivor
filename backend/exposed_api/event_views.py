from authentication.permissions import IsAdmin
from rest_framework import permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import Event

from .event_serializers import EventSerializer


class EventListView(APIView):
    def get_permissions(self):
        """
        Override to return different permissions based on HTTP method.
        GET requests are allowed for everyone, but POST, PUT, DELETE require admin.
        """
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get(self, request):
        """
        List all events, open to everyone
        """
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Create a new event, only for admins
        """
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            if "image" in request.FILES:
                serializer.validated_data["image"] = request.FILES["image"]

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventDetailView(APIView):
    permission_classes = [IsAdmin]

    def get_object(self, event_id):
        """
        Helper method to get the event object
        """
        try:
            return Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return None

    def put(self, request, event_id):
        """
        Update an event, only for admins
        """
        event = self.get_object(event_id)
        if not event:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            if "image" in request.FILES:
                serializer.validated_data["image"] = request.FILES["image"]

            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id):
        """
        Delete an event, only for admins
        """
        event = self.get_object(event_id)
        if not event:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
