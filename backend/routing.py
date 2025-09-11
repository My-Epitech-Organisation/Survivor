import messaging.routing
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

application = ProtocolTypeRouter(
    {
        "websocket": AuthMiddlewareStack(URLRouter(messaging.routing.websocket_urlpatterns)),
    }
)
