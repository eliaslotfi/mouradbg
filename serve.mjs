import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT) || 8123;

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.mp4', 'video/mp4'],
]);

function notFound(response) {
  response.writeHead(404, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  response.end('not found');
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const decodedPath = decodeURIComponent(pathname);
    const relativePath = decodedPath.replace(/^[/\\]+/, '');
    const filePath = normalize(join(root, relativePath));

    if (!filePath.startsWith(root)) {
      notFound(response);
      return;
    }

    const file = await readFile(filePath);
    const contentType = mimeTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream';

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentType,
    });
    response.end(file);
  } catch {
    notFound(response);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('Terranova is available at http://127.0.0.1:' + port);
});
