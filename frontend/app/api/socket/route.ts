export async function GET() {
  return new Response(JSON.stringify({
    socketUrl: 'ws://localhost:8000/socket.io/',
    message: 'WebSocket endpoint info'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
