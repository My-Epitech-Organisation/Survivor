import json
import logging
import time
from datetime import datetime

from django.db import transaction
from django.db.models import Max, Q
from django.http import HttpResponseForbidden, JsonResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods, require_POST
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Message, ReadReceipt, Thread, TypingIndicator
from .permissions import IsMessagingEligibleUser
from .serializers import (
    MessageSerializer,
    ReadReceiptSerializer,
    ThreadCreateSerializer,
    ThreadDetailSerializer,
    ThreadSerializer,
    TypingIndicatorSerializer,
)

logger = logging.getLogger(__name__)


class ThreadListView(APIView):
    """
    List threads for the current user and create a new thread.
    """

    permission_classes = [IsMessagingEligibleUser]

    def get(self, request):
        """Get all threads for the current user."""
        threads = Thread.objects.filter(participants=request.user)

        serializer = ThreadSerializer(threads, many=True, context={"request": request})

        return Response(serializer.data)

    def post(self, request):
        """Create a new thread or return existing thread with the same participants"""
        serializer = ThreadCreateSerializer(data=request.data, context={"request": request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        participants_ids = serializer.validated_data["participants"]
        message_body = serializer.validated_data["message"]

        user_threads = Thread.objects.filter(participants=request.user)
        for thread in user_threads:
            thread_participants = set(thread.participants.values_list("id", flat=True))
            # Thread exists
            if thread_participants == set(participants_ids):
                message = Message.objects.create(thread=thread, sender=request.user, body=message_body)

                thread.last_message_at = timezone.now()
                thread.save()

                return Response(
                    {
                        "thread": ThreadSerializer(thread, context={"request": request}).data,
                        "message": MessageSerializer(message).data,
                    },
                    status=status.HTTP_201_CREATED,
                )

        # No thread found, create a new one
        with transaction.atomic():
            thread = Thread.objects.create()
            for user_id in participants_ids:
                thread.participants.add(user_id)

            message = Message.objects.create(thread=thread, sender=request.user, body=message_body)

            thread.last_message_at = timezone.now()
            thread.save()

        return Response(
            {
                "thread": ThreadSerializer(thread, context={"request": request}).data,
                "message": MessageSerializer(message).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ThreadDetailView(APIView):
    """
    Retrieve or delete a thread instance.
    """

    permission_classes = [IsMessagingEligibleUser]

    def get_object(self, thread_id, user):
        """Get thread object and check if user is a participant"""
        thread = get_object_or_404(Thread, id=thread_id)

        if user not in thread.participants.all():
            raise PermissionDenied("You are not a participant in this thread.")

        return thread

    def get(self, request, thread_id):
        """Get a specific thread with all messages"""
        thread = self.get_object(thread_id, request.user)

        serializer = ThreadDetailSerializer(thread, context={"request": request})

        return Response(serializer.data)

    def delete(self, request, thread_id):
        """Delete a thread (only works if all messages are deleted)"""
        thread = self.get_object(thread_id, request.user)

        if thread.messages.exists():
            return Response({"detail": "Cannot delete thread with messages"}, status=status.HTTP_400_BAD_REQUEST)

        thread.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageListView(APIView):
    """
    Create messages in a thread
    """

    permission_classes = [IsMessagingEligibleUser]

    def get_thread(self, thread_id, user):
        """Get thread and check user is a participant"""
        thread = get_object_or_404(Thread, id=thread_id)

        if user not in thread.participants.all():
            raise PermissionDenied("You are not a participant in this thread.")

        return thread

    def post(self, request, thread_id):
        """Create a new message in the thread"""
        thread = self.get_thread(thread_id, request.user)

        recent_messages = Message.objects.filter(
            thread=thread, sender=request.user, created_at__gte=timezone.now() - timezone.timedelta(seconds=1)
        )

        if recent_messages.count() >= 5:
            return Response(
                {"detail": "You're sending messages too quickly. Please slow down."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(thread=thread, sender=request.user)

            thread.last_message_at = timezone.now()
            thread.save()

            return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsMessagingEligibleUser])
def mark_thread_read(request, thread_id):
    """
    Mark messages in a thread as read up to a specified message.
    """

    thread = get_object_or_404(Thread, id=thread_id)
    if request.user not in thread.participants.all():
        return Response({"detail": "You are not a participant in this thread."}, status=status.HTTP_403_FORBIDDEN)

    message_id = request.data.get("message_id")
    if not message_id:
        message = thread.messages.order_by("-created_at").first()
        if not message:
            return Response({"detail": "No messages in this thread."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        message = get_object_or_404(Message, id=message_id, thread=thread)

    read_receipt, created = ReadReceipt.objects.update_or_create(
        thread=thread, user=request.user, defaults={"last_read_message": message}
    )

    return Response(ReadReceiptSerializer(read_receipt).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsMessagingEligibleUser])
def update_typing_status(request, thread_id):
    """
    Update the typing status for a user in a thread.
    This endpoint is optimized for frequent calls (e.g., during typing).
    """
    thread = get_object_or_404(Thread, id=thread_id)
    if request.user not in thread.participants.all():
        return Response({"detail": "You are not a participant in this thread."}, status=status.HTTP_403_FORBIDDEN)

    is_typing = request.data.get("is_typing", True)
    typing_indicator, created = TypingIndicator.objects.update_or_create(
        thread=thread, user=request.user, defaults={"is_typing": is_typing}
    )

    return Response({"status": "ok", "is_typing": is_typing}, status=status.HTTP_200_OK)


@require_GET
@csrf_exempt
def thread_events(request, thread_id):
    """
    Stream events from a thread using Server-Sent Events (SSE).
    Events: new messages, typing indicators, read receipts
    """
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden("Authentication required")
    if user.role not in ["admin", "founder", "investor"]:
        return HttpResponseForbidden("Access denied. Only admin, founder, and investor roles can access messaging.")

    try:
        thread = Thread.objects.get(id=thread_id)
        if user not in thread.participants.all():
            return HttpResponseForbidden("You are not a participant in this thread")
    except Thread.DoesNotExist:
        return HttpResponseForbidden("Thread not found")

    last_event_id = request.META.get("HTTP_LAST_EVENT_ID") or request.GET.get("last_event_id")

    # Function to generate SSE events
    def event_stream():
        last_message_id = None
        last_typing_check = None
        last_read_check = None
        cycle_count = 0

        if last_event_id:
            try:
                # Format is expected to be "message:123" or similar
                event_type, event_id = last_event_id.split(":", 1)
                if event_type == "message":
                    last_message_id = int(event_id)
            except (ValueError, TypeError):
                pass

        while True:
            # Check for new messages - This is highest priority and checked every cycle
            if last_message_id:
                new_messages = thread.messages.filter(id__gt=last_message_id).order_by("id")
            else:
                new_messages = thread.messages.order_by("-id")[:5]
                new_messages = reversed(list(new_messages))

            messages_found = False
            for message in new_messages:
                messages_found = True
                data = {
                    "type": "message",
                    "id": message.id,
                    "sender_id": message.sender.id,
                    "body": message.body,
                    "created_at": message.created_at.isoformat(),
                }

                last_message_id = message.id

                # Format as SSE
                event_data = f"id:message:{message.id}\n"
                event_data += f"event:message\n"
                event_data += f"data:{json.dumps(data)}\n\n"

                yield event_data

            # Check for typing indicators every 500ms (every cycle)
            typing_indicators = TypingIndicator.objects.filter(
                thread=thread,
                is_typing=True,
                started_at__gte=timezone.now() - timezone.timedelta(seconds=5),  # Auto-expire after 5 seconds
            ).exclude(user=user)

            if typing_indicators.exists():
                typing_users = [
                    {"id": indicator.user.id, "name": indicator.user.name} for indicator in typing_indicators
                ]

                data = {"type": "typing", "users": typing_users}

                # Format as SSE
                event_data = f"event:typing\n"
                event_data += f"data:{json.dumps(data)}\n\n"

                yield event_data

            last_typing_check = timezone.now()

            # Check for read receipts every 1 second (every 2 cycles)
            if not last_read_check or cycle_count % 2 == 0:
                read_receipts = ReadReceipt.objects.filter(
                    thread=thread, read_at__gte=timezone.now() - timezone.timedelta(seconds=10)
                ).exclude(user=user)

                if read_receipts.exists():
                    receipt_data = [
                        {
                            "user_id": receipt.user.id,
                            "name": receipt.user.name,
                            "last_read_message_id": receipt.last_read_message.id,
                            "read_at": receipt.read_at.isoformat(),
                        }
                        for receipt in read_receipts
                    ]

                    data = {"type": "read_receipt", "receipts": receipt_data}

                    # Format as SSE
                    event_data = f"event:read_receipt\n"
                    event_data += f"data:{json.dumps(data)}\n\n"

                    yield event_data

                last_read_check = timezone.now()

            if not messages_found and cycle_count % 4 == 0:
                yield ": heartbeat\n\n"

            cycle_count = (cycle_count + 1) % 100
            time.sleep(0.1)

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")

    # Add SSE-specific headers - optimized for real-time performance
    response["Cache-Control"] = "no-cache, no-transform"
    response["Connection"] = "keep-alive"
    response["X-Accel-Buffering"] = "no"
    response["Transfer-Encoding"] = "chunked"
    response["Access-Control-Allow-Origin"] = "*"

    # Quicker reconnection for better user experience
    response["Retry"] = "1000"  # 1 second
    return response
