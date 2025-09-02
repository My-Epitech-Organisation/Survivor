import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { io as Client } from 'socket.io-client';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Connexion au backend Django Socket.IO
    const backendSocket = Client('http://backend:8000');

    io.on('connection', (clientSocket) => {
      console.log('Client connected:', clientSocket.id);

      // Proxy des messages du client vers Django
      clientSocket.on('message', (data) => {
        console.log('Message from client:', data);
        backendSocket.emit('message', data);
      });

      // Proxy des messages de Django vers le client
      backendSocket.on('message', (data) => {
        console.log('Message from Django:', data);
        clientSocket.emit('message', data);
      });

      clientSocket.on('disconnect', () => {
        console.log('Client disconnected:', clientSocket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
