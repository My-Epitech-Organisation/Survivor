import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

from .models import Message, Thread

User = get_user_model()


class ThreadConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time thread updates.
    """

    async def connect(self):
        """
        Called when the websocket is handshaking as part of initial connection.
        """
        # Extract token from query parameters
        query_string = self.scope.get("query_string", b"").decode("utf-8")
        token = None

        if "token=" in query_string:
            try:
                token = query_string.split("token=")[1].split("&")[0]
                access_token = AccessToken(token)
                user_id = access_token.payload.get("user_id")
                self.user = await sync_to_async(User.objects.get)(id=user_id)
            except (InvalidToken, TokenError, User.DoesNotExist, ValueError):
                await self.close()
                return
        else:
            await self.close()
            return

        # Join user's personal group for thread updates
        self.group_name = f"user_{self.user.id}_threads"
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason.
        """
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        """
        try:
            data = json.loads(text_data)
            message_type = data.get("type")

            if message_type == "ping":
                # Respond to ping to keep connection alive
                await self.send(text_data=json.dumps({"type": "pong", "timestamp": timezone.now().isoformat()}))

        except json.JSONDecodeError:
            pass

    # Event handlers for thread updates
    async def thread_created(self, event):
        """
        Send thread creation notification to user.
        """
        await self.send(
            text_data=json.dumps(
                {
                    "type": "thread_created",
                    "thread_id": event["thread_id"],
                    "participants": event["participants"],
                    "created_at": event["created_at"],
                }
            )
        )

    async def thread_updated(self, event):
        """
        Send thread update notification to user.
        """
        await self.send(
            text_data=json.dumps(
                {
                    "type": "thread_updated",
                    "thread_id": event["thread_id"],
                    "last_message_at": event["last_message_at"],
                    "last_message": event["last_message"],
                }
            )
        )

    async def message_received(self, event):
        """
        Send new message notification to user.
        """
        await self.send(
            text_data=json.dumps(
                {
                    "type": "message_received",
                    "thread_id": event["thread_id"],
                    "message_id": event["message_id"],
                    "sender_id": event["sender_id"],
                    "body": event["body"],
                    "created_at": event["created_at"],
                }
            )
        )
