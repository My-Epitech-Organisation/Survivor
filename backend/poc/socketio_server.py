import socketio
from django.http import HttpResponse

# Créer l'instance Socket.IO
sio = socketio.AsyncServer(
    cors_allowed_origins="*",  # Pour le développement - à restreindre en production
    async_mode='asgi'
)

# Wrapper ASGI pour Socket.IO
socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")
    await sio.emit('message', 'Welcome to the chat!', room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

@sio.event
async def message(sid, data):
    print(f"Message from {sid}: {data}")
    # Diffuser le message à tous les clients connectés
    await sio.emit('message', data)

# Vue Django pour servir Socket.IO (optionnel, pour debug)
def socket_status(request):
    return HttpResponse("Socket.IO server is running")
