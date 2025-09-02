import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(JSON.stringify({
    socketUrl: 'ws://localhost:8000/socket.io/',
    message: 'WebSocket endpoint info'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
