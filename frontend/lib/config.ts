// lib/config.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  socketURL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost',
};

export const SERVER_API_CONFIG = {
  baseURL: 'http://backend:8000/api',
  socketURL: 'http://backend:8000',
};
