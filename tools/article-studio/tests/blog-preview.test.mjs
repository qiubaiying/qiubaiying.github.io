import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { blogPreviewPath, startBlogPreview } from '../blog-preview.mjs';

test('formats a saved article path for the built blog', () => {
  assert.equal(blogPreviewPath('2026-09-29-测试文章.md'), '/2026/09/29/%E6%B5%8B%E8%AF%95%E6%96%87%E7%AB%A0/');
  assert.throws(() => blogPreviewPath('../secret.md'), /文章文件名无效/);
});

test('serves only built blog files and prevents service worker registration', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-preview-'));
  let preview;
  try {
    const site = path.join(directory, 'site');
    await fs.mkdir(path.join(site, '2026', '09', '29', 'test'), { recursive: true });
    await fs.mkdir(path.join(site, 'css'));
    await fs.writeFile(path.join(site, '2026', '09', '29', 'test', 'index.html'), '<h1>博客页面</h1>');
    await fs.writeFile(path.join(site, 'css', 'main.css'), 'body { color: green; }');
    await fs.writeFile(path.join(directory, 'private.txt'), 'private');
    await fs.symlink(path.join(directory, 'private.txt'), path.join(site, 'private.txt'));
    preview = await startBlogPreview(site);
    const article = await fetch(`${preview.baseUrl}/2026/09/29/test/`);
    assert.equal(article.status, 200);
    assert.match(await article.text(), /博客页面/);
    assert.equal(article.headers.get('content-security-policy'), "script-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'none'");
    const css = await fetch(`${preview.baseUrl}/css/main.css`);
    assert.equal(css.headers.get('content-type'), 'text/css; charset=utf-8');
    assert.equal((await fetch(`${preview.baseUrl}/private.txt`)).status, 404);
    assert.equal((await fetch(`${preview.baseUrl}/missing/`)).status, 404);
  } finally {
    if (preview) await preview.close();
    await fs.rm(directory, { recursive: true, force: true });
  }
});
