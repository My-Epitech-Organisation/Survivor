// lib/socket-config.ts
export const getSocketUrl = () => {
  console.log('Determining socket URL...');
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    } else {
      return `http://${hostname}:8000`;
    }
  }

  console.log('�️ [SOCKET-CONFIG] Server-side fallback');
  return 'http://backend:8000';
};

export const getAPIUrl = () => {
  console.log('Determining API URL...');
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000/api';
    } else {
      return `http://${hostname}:8000/api`;
    }
  }

  console.log('🖥️ [API-CONFIG] Server-side fallback');
  return 'http://backend:8000/api';
};
