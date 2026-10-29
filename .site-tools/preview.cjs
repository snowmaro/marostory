// Local static preview with the same clean routes as Firebase Hosting.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { rewrites } = require(path.join(root, 'firebase.json')).hosting;
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.webp':'image/webp', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.xml':'application/xml', '.txt':'text/plain' };
http.createServer(async (req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const rewrite = rewrites.find((r) => r.source === name);
    if (rewrite) name = rewrite.destination;
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep) || name.split('/').some(part=>part.startsWith('.'))) throw Error('Invalid path');
    const body = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173/'));
