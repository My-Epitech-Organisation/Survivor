import http from 'http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
  target: 'http://backend:8000',
  ws: true,
  changeOrigin: true
});

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/socket.io/')) {
    proxy.web(req, res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.on('upgrade', (request, socket, head) => {
  if (request.url.startsWith('/socket.io/')) {
    proxy.ws(request, socket, head);
  }
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500);
  res.end('Proxy error');
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket proxy running on port ${PORT}`);
});

module.exports = server;
