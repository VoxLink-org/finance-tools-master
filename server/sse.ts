import { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import { verifyJWT } from './jwt-generate';


function checkJWT(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1] || req.query.jwt?.toString();
    if (!token) {
        res.status(401).send('Unauthorized');
        return;
    }
    const decoded = verifyJWT(token);
    if (!decoded) {
        res.status(401).send('Unauthorized');
        return;
    }
    console.log(decoded);
    return true
}

export const sse = (req: Request, res: Response, next: NextFunction) => {
  const targetUrl = new URL(req.originalUrl, 'http://0.0.0.0:8000');

  if (req.path !== '/sse' && !checkJWT(req, res)) {
    return;
  }
  
  const proxyReq = http.request(
    {
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path: targetUrl.pathname + targetUrl.search,
      method: req.method,
      headers: {
        ...req.headers, // Forward original headers
        host: targetUrl.host, // Important: set host to the target's host
        connection: 'keep-alive', // SSE specific
        'accept': 'text/event-stream', // SSE specific
        'cache-control': 'no-cache', // SSE specific
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, {
        ...proxyRes.headers,
        'content-type': 'text/event-stream', // Ensure SSE content type
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
      });

      proxyRes.pipe(res);

      // Clean up on client disconnect
      req.on('close', () => {
        proxyRes.destroy();
        proxyReq.destroy();
      });
    }
  );

  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    if (!res.headersSent) {
      res.status(500).send('Proxy error');
    }
    next(err);
  });

  // If the original request has a body (e.g., POST), pipe it to the proxy request
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
};