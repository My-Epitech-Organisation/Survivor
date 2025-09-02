import socketio
from django.http import HttpResponse

sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi'
)

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
    await sio.emit('message', data)

def socket_status(request):
    return HttpResponse("Socket.IO server is running")
