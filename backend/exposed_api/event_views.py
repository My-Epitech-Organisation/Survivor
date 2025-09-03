from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from admin_panel.models import Event
from .event_serializers import EventSerializer

class EventListView(APIView):
    def get(self, request):
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
