import { NextRequest } from 'next/server';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { parse } from 'url';

export async function GET(request: NextRequest) {
  return new Response('WebSocket upgrade required', {
    status: 426,
    headers: {
      'Upgrade': 'websocket',
    }
  });
}
