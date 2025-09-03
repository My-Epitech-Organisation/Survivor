"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

import socketio
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django_asgi_app = get_asgi_application()

print("🚀 [DJANGO] Starting Socket.IO server...")

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")


@sio.event
async def connect(sid, environ):
    await sio.emit("message", "Welcome to the chat!", room=sid)


@sio.event
async def disconnect(sid):
    pass


@sio.event
async def message(sid, data):
    await sio.emit("message", data)
    print(f"📤 [DJANGO] Message broadcasted to all clients")


application = socketio.ASGIApp(sio, django_asgi_app)

print("✅ [DJANGO] Socket.IO server configured successfully")
