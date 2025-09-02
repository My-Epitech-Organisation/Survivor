import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Pour les WebSockets, nous devons utiliser une approche différente
  // Car Next.js ne supporte pas directement les WebSockets dans les routes API
  
  // Retourner les informations de connexion WebSocket
  return new Response(JSON.stringify({
    socketUrl: 'ws://localhost:8000/socket.io/',
    message: 'WebSocket endpoint info'
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
