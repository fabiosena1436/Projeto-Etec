import { createServer } from 'node:http';
import { createHandler } from './handler';
import { getDb } from './db';
const handler = createHandler(getDb);
createServer(async (req, res) => {
  const parts: Buffer[] = [];
  for await (const chunk of req) {
    parts.push(Buffer.from(chunk));
    if (parts.reduce((n, part) => n + part.length, 0) > 3000000) { res.writeHead(413); res.end(); return; }
  }
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) if (value) headers.set(name, Array.isArray(value) ? value.join(',') : value);
  const body = ['GET', 'HEAD'].includes(req.method || 'GET') ? undefined : Buffer.concat(parts);
  const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body });
  const response = await handler(request);
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(3001, '127.0.0.1', () => console.log('API: http://localhost:3001'));
