// lib/socket-config.ts
export const getSocketUrl = () => {
  console.log('Determining socket URL...');
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('🌐 [SOCKET-CONFIG] Hostname:', hostname);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('� [SOCKET-CONFIG] Using localhost:8000 for local development');
      return 'http://localhost:8000';
    } else {
      console.log('🌍 [SOCKET-CONFIG] Using external IP with port 8000');
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
    console.log('🌐 [API-CONFIG] Hostname:', hostname);
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🏠 [API-CONFIG] Using localhost:8000 for local development');
      return 'http://localhost:8000/api';
    } else {
      console.log('🌍 [API-CONFIG] Using external IP with port 8000');
      return `http://${hostname}:8000/api`;
    }
  }

  console.log('🖥️ [API-CONFIG] Server-side fallback');
  return 'http://backend:8000/api';
};
