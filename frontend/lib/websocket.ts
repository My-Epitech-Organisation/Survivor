import { getBackendUrl } from './config';
import { getToken } from './api';
import { io, Socket } from 'socket.io-client';
import { User } from "@/types/user"

export type WebSocketEventType = 'thread_created' | 'thread_updated' | 'message_received';

export interface WebSocketEvent {
  type: WebSocketEventType;
  thread_id: number;
  participants?: User[];
  created_at?: string;
  last_message_at?: string;
  last_message?: string;
  message_id?: number;
  sender_id?: number;
  body?: string;
}

export class ThreadWebSocket {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private eventListeners: Map<WebSocketEventType, ((event: WebSocketEvent) => void)[]> = new Map();
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  private getSocketUrl(): string {
    const backendUrl = getBackendUrl().replace('/api', '');
    return backendUrl;
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    this.isConnecting = true;

    try {
      const socketUrl = this.getSocketUrl();
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
      });

      this.socket.on('connect', () => {
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        const token = getToken();
        if (token) {
          this.socket?.emit('join_threads', { token });
        }
      });

      this.socket.on('connected', ()=>{});

      this.socket.on('thread_created', (data) => {
        this.notifyListeners('thread_created', {
          type: 'thread_created',
          thread_id: data.thread_id,
          participants: data.participants || [],
          created_at: data.created_at
        });
      });

      this.socket.on('thread_updated', (data) => {
        this.notifyListeners('thread_updated', {
          type: 'thread_updated',
          thread_id: data.thread_id,
          last_message_at: data.last_message_at,
          last_message: data.last_message
        });
      });

      this.socket.on('message_received', (data) => {
        this.notifyListeners('message_received', {
          type: 'message_received',
          thread_id: data.thread_id,
          message_id: data.message_id,
          sender_id: data.sender_id,
          body: data.body,
          created_at: data.created_at
        });
      });

      this.socket.on('error', (error) => {
        this.isConnecting = false;
      });

      this.socket.on('disconnect', () => {
        this.isConnecting = false;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      });

    } catch (error) {
      this.isConnecting = false;
    }
  }

  private notifyListeners(eventType: WebSocketEventType, event: WebSocketEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  public addEventListener(eventType: WebSocketEventType, callback: (event: WebSocketEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  public removeEventListener(eventType: WebSocketEventType, callback: (event: WebSocketEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
let threadWebSocket: ThreadWebSocket | null = null;

export const getThreadWebSocket = (): ThreadWebSocket => {
  if (!threadWebSocket) {
    threadWebSocket = new ThreadWebSocket();
  }
  return threadWebSocket;
};
