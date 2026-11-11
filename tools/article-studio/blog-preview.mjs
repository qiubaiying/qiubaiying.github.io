import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.png', 'image/png'], ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'], ['.webp', 'image/webp'], ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'], ['.woff', 'font/woff'], ['.woff2', 'font/woff2']
]);

export function blogPreviewPath(filename) {
  if (typeof filename !== 'string' || path.basename(filename) !== filename || !/^\d{4}-\d{2}-\d{2}-.+\.md$/.test(filename)) throw new Error('文章文件名无效');
  return `/${filename.slice(0, 10).replace(/-/g, '/')}/${encodeURIComponent(filename.slice(11, -3))}/`;
}

export async function startBlogPreview(siteDir, host = '127.0.0.1') {
  const root = await fs.realpath(siteDir);
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405).end();
        return;
      }
      const pathname = decodeURIComponent(new URL(req.url || '/', `http://${host}`).pathname);
      if (pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) {
        res.writeHead(400).end();
        return;
      }
      const candidate = path.resolve(root, `.${pathname}`);
      if (candidate !== root && !candidate.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      const stat = await fs.stat(candidate).catch(() => null);
      const file = stat?.isDirectory() ? path.join(candidate, 'index.html') : candidate;
      const real = await fs.realpath(file).catch(() => null);
      if (!real || !real.startsWith(root + path.sep) || !(await fs.stat(real)).isFile()) {
        res.writeHead(404).end('预览文件不存在');
        return;
      }
      const headers = {
        'content-type': mime.get(path.extname(real).toLowerCase()) || 'application/octet-stream',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff'
      };
      if (real.endsWith('.html')) headers['content-security-policy'] = "script-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'none'";
      res.writeHead(200, headers);
      if (req.method === 'HEAD') res.end();
      else res.end(await fs.readFile(real));
    } catch {
      res.writeHead(400).end('无法打开博客预览');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, host, resolve);
  });
  return { baseUrl: `http://${host}:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}
