"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

import django
from asgiref.sync import sync_to_async
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

import socketio  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402
from messaging.models import Message, Thread  # noqa: E402
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError  # noqa: E402
from rest_framework_simplejwt.tokens import AccessToken  # noqa: E402

django_asgi_app = get_asgi_application()

print("🚀 [DJANGO] Starting Socket.IO server...")

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

# Store connected users and their threads
connected_users = {}


def authenticate_user(token):
    """Authenticate user from JWT token"""
    try:
        access_token = AccessToken(token)
        user_id = access_token["user_id"]
        User = get_user_model()
        user = User.objects.get(id=user_id)
        return user
    except (InvalidToken, TokenError, User.DoesNotExist):
        return None


# Async version for use in async context
@sync_to_async
def authenticate_user_async(token):
    """Authenticate user from JWT token (async version)"""
    return authenticate_user(token)


@sio.event
async def connect(sid, environ, auth=None):
    print(f"🔗 [SOCKET.IO] Client connected: {sid}")
    await sio.emit("connected", {"status": "connected"}, room=sid)


@sio.event
async def disconnect(sid):
    print(f"🔌 [SOCKET.IO] Client disconnected: {sid}")
    # Remove from connected users
    connected_users.pop(sid, None)


@sio.event
async def join_thread(sid, data):
    """Join a chat thread"""
    token = data.get("token")
    thread_id = data.get("thread_id")

    user = await authenticate_user_async(token)
    if not user:
        await sio.emit("error", {"message": "Authentication failed"}, room=sid)
        return

    try:
        thread = await sync_to_async(Thread.objects.get)(id=thread_id)
        is_participant = await sync_to_async(lambda: user in thread.participants.all())()
        if not is_participant:
            await sio.emit("error", {"message": "Not a participant in this thread"}, room=sid)
            return

        # Join the thread room
        await sio.enter_room(sid, f"thread_{thread_id}")
        connected_users[sid] = {"user": user, "thread_id": thread_id}

        await sio.emit("joined_thread", {"thread_id": thread_id}, room=sid)
        print(f"✅ [SOCKET.IO] User {user.id} joined thread {thread_id}")

    except Thread.DoesNotExist:
        await sio.emit("error", {"message": "Thread not found"}, room=sid)


@sio.event
async def leave_thread(sid, data):
    """Leave a chat thread"""
    thread_id = data.get("thread_id")
    if sid in connected_users:
        await sio.leave_room(sid, f"thread_{thread_id}")
        del connected_users[sid]
        print(f"👋 [SOCKET.IO] User left thread {thread_id}")


@sio.event
async def send_message(sid, data):
    """Send a message to a thread"""
    if sid not in connected_users:
        await sio.emit("error", {"message": "Not in a thread"}, room=sid)
        return

    token = data.get("token")
    thread_id = data.get("thread_id")
    body = data.get("body")

    user = await authenticate_user_async(token)
    if not user:
        await sio.emit("error", {"message": "Authentication failed"}, room=sid)
        return

    try:
        thread = await sync_to_async(Thread.objects.get)(id=thread_id)
        is_participant = await sync_to_async(lambda: user in thread.participants.all())()
        if not is_participant:
            await sio.emit("error", {"message": "Not a participant"}, room=sid)
            return

        message = await sync_to_async(
            lambda: Message.objects.filter(thread=thread, sender=user, body=body).order_by("-created_at").first()
        )()

        if not message:
            await sio.emit("error", {"message": "Message not found"}, room=sid)
            return

        thread.last_message_at = message.created_at
        await sync_to_async(thread.save)()

        message_data = {
            "id": message.id,
            "sender_id": user.id,
            "sender_name": user.name,
            "body": message.body,
            "created_at": message.created_at.isoformat(),
        }

        await sio.emit("new_message", message_data, room=f"thread_{thread_id}", skip_sid=sid)
        print(f"📤 [SOCKET.IO] Message broadcasted in thread {thread_id} by user {user.id}")

    except Thread.DoesNotExist:
        await sio.emit("error", {"message": "Thread not found"}, room=sid)
    except Exception as e:
        print(f"❌ [SOCKET.IO] Error sending message: {e}")
        await sio.emit("error", {"message": "Failed to send message"}, room=sid)


@sio.event
async def typing_start(sid, data):
    """User started typing"""
    if sid not in connected_users:
        return

    thread_id = connected_users[sid]["thread_id"]
    user = connected_users[sid]["user"]

    typing_data = {"user_id": user.id, "user_name": user.name, "is_typing": True}

    await sio.emit("typing", typing_data, room=f"thread_{thread_id}", skip_sid=sid)


@sio.event
async def typing_stop(sid, data):
    """User stopped typing"""
    if sid not in connected_users:
        return

    thread_id = connected_users[sid]["thread_id"]
    user = connected_users[sid]["user"]

    typing_data = {"user_id": user.id, "user_name": user.name, "is_typing": False}

    await sio.emit("typing", typing_data, room=f"thread_{thread_id}", skip_sid=sid)


application = socketio.ASGIApp(sio, django_asgi_app)

print("✅ [DJANGO] Socket.IO server configured successfully")
