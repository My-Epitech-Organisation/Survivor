from auditlog.models import AuditLog
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
        # Remove id from request data if present
        request_data = request.data.copy()
        if "id" in request_data:
            del request_data["id"]

        # Generate a new ID
        try:
            max_id = Event.objects.all().order_by("-id").first()
            new_id = 1 if not max_id else max_id.id + 1
        except Exception:
            new_id = 1

        # Add the new ID to the request data
        request_data["id"] = new_id

        serializer = EventSerializer(data=request_data)
        if serializer.is_valid():
            if "image" in request.FILES:
                serializer.validated_data["image"] = request.FILES["image"]
            # Image field handling for base64 images from frontend
            elif "image" in request_data and isinstance(request_data["image"], str):
                serializer.validated_data["image"] = request_data["image"]

            event = serializer.save()

            AuditLog.objects.create(action=f"New event created: {event.name}", user=request.user.name, type="event")

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
            if request.data.get("image_url"):
                image_path = request.data["image_url"]
                from django.conf import settings

                media_url = settings.MEDIA_URL.rstrip("/")
                if image_path.startswith(media_url):
                    image_path = image_path[len(media_url) :]
                serializer.validated_data["image"] = image_path.lstrip("/")
            elif "image" in request.FILES:
                serializer.validated_data["image"] = request.FILES["image"]

            updated_event = serializer.save()

            AuditLog.objects.create(
                action=f"Event updated: {updated_event.name}", user=request.user.name, type="event"
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id):
        """
        Delete an event, only for admins
        """
        event = self.get_object(event_id)
        if not event:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

        event_name = event.name
        AuditLog.objects.create(action=f"Event deleted: {event_name}", user=request.user.name, type="event")

        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
