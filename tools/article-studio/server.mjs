import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { OBSIDIAN_ROOT, DEFAULT_IMAGES, resolveImages, readGrantedImage, imageReferences } from './local-images.mjs';
import { normalizeImageLinks } from './blog-image-links.mjs';
import { formatBlogSourceFootnote } from './public/blog-source.js';
import { blogPreviewPath, startBlogPreview } from './blog-preview.mjs';
import { listSourceFolders, locateSourceFolder, saveSourceDraft } from './source-draft.mjs';
import { deleteStudioPost, readStudioPost } from './saved-posts.mjs';
import { listManagedPosts, readManagedPost, restoreManagedPost, publishManagedPost, unpublishManagedPost } from './post-publishing.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const blog = path.resolve(here, '../..');
const posts = path.join(blog, '_posts');
const host = '127.0.0.1';
const port = Number(process.env.ARTICLE_STUDIO_PORT || 4174);
const MAX_BODY = 16 * 1024 * 1024;
const allowedExt = new Map([['image/png', '.png'], ['image/jpeg', '.jpg'], ['image/webp', '.webp'], ['image/gif', '.gif']]);
const expectedRemote = /^(?:https:\/\/github\.com\/|git@github\.com:)helloo2020\/helloo2020\.github\.io(?:\.git)?$/;
const publishing = { repo: blog, postsDir: posts, expectedRemote, preflight: buildJekyll };
let previewServer;

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(payload));
}
function requestBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, chunks = [];
    req.on('data', chunk => { size += chunk.length; if (size > MAX_BODY) { reject(new Error('文件总大小超过 16 MB')); req.destroy(); } else chunks.push(chunk); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new Error('请求格式错误')); } });
    req.on('error', reject);
  });
}
async function buildJekyll({ preview = false } = {}) {
  const vendor = path.join(blog, '.jekyll-vendor');
  const executable = path.join(vendor, 'bin', 'jekyll');
  if (!(await fs.stat(executable).catch(() => null))?.isFile()) throw new Error('找不到本机 Jekyll 构建工具，发布前请检查博客环境');
  await new Promise((resolve, reject) => {
    const child = spawn(executable, ['build', '--quiet'], { cwd: blog, env: { ...process.env, GEM_HOME: vendor, GEM_PATH: vendor, ...(preview ? { JEKYLL_ENV: 'article_studio_preview' } : {}) }, stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    const timer = setTimeout(() => child.kill(), 120000);
    child.stderr.on('data', part => err += part);
    child.on('error', reject);
    child.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`博客构建失败：${err.trim() || `退出码 ${code}`}`)); });
  });
}
async function previewBlogPost(filename) {
  const post = await readStudioPost(filename, posts);
  await buildJekyll({ preview: true });
  const pathname = blogPreviewPath(filename);
  const output = path.join(blog, '_site', decodeURIComponent(pathname), 'index.html');
  if (!(await fs.stat(output).catch(() => null))?.isFile()) throw new Error('博客构建完成，但找不到这篇文章的页面');
  previewServer ||= startBlogPreview(path.join(blog, '_site')).catch(error => { previewServer = null; throw error; });
  const { baseUrl } = await previewServer;
  return { url: `${baseUrl}${pathname}`, title: post.title, date: post.date };
}
function slugify(s) {
  return s.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 70);
}
function validDate(date) { return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T12:00:00`)); }
function yamlString(value) { return JSON.stringify(String(value)); }
async function savePost(data) {
  const title = String(data.title || '').trim();
  const body = String(data.markdown || '').trim();
  const date = String(data.date || '');
  if (!title || title.length > 150 || !body || body.length > 300000 || !validDate(date)) throw new Error('请填写有效的标题、日期和正文');
  const slug = slugify(title);
  if (!slug) throw new Error('标题无法用于文件名');
  const editingFilename = data.editingFilename || '';
  const existing = editingFilename ? await readStudioPost(editingFilename, posts) : null;
  if (existing && existing.revision !== data.expectedRevision) throw new Error('文章已被其他操作修改，请重新从清单载入');
  if (existing && existing.date !== date) throw new Error('编辑时不能修改发布日期，以免改变文章链接');
  const filename = existing ? editingFilename : `${date}-${slug}.md`;
  const filepath = path.join(posts, filename);
  if (!existing) try { await fs.access(filepath); throw new Error('博客中已有同名文章，请修改标题或日期'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const style = ['sage', 'classic', 'modern', 'literary', 'warm', 'minimal'].includes(data.style) ? data.style : 'sage';
  const tags = Array.isArray(data.tags) ? data.tags.map(x => String(x).trim()).filter(Boolean).slice(0, 8) : [];
  const sourceUrl = String(data.sourceUrl || '').trim();
  const sourceAccount = String(data.sourceAccount || 'Scond').trim();
  const sourcePublishedAt = String(data.sourcePublishedAt || '').trim();
  let sourceHref = '';
  if (sourceUrl) {
    let link;
    try { link = new URL(sourceUrl); } catch { throw new Error('公众号原文链接格式不正确'); }
    if (link.protocol !== 'https:' || link.hostname !== 'mp.weixin.qq.com' || !/^\/s(?:\/|$)/.test(link.pathname) || /[\s()[\]]/.test(sourceUrl)) throw new Error('请填写有效的公众号原文链接');
    if (!sourceAccount || sourceAccount.length > 60 || /[\r\n|｜]/.test(sourceAccount)) throw new Error('公众号名称格式不正确');
    if (sourcePublishedAt && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sourcePublishedAt) || Number.isNaN(Date.parse(sourcePublishedAt)))) throw new Error('公众号发布时间格式不正确');
    sourceHref = link.href;
  }
  const imageMap = new Map();
  const fontSize = [14,16,18,20,22].includes(Number(data.fontSize)) ? Number(data.fontSize) : 16;
  const bodyRefs = imageReferences(body);
  const incomingAssets = Array.isArray(data.assets) ? [...data.assets] : [];
  for (const local of (Array.isArray(data.localImages) ? data.localImages : [])) {
    if (!bodyRefs.includes(local.ref)) continue;
    const image = await readGrantedImage(local.id);
    incomingAssets.push({ name: local.ref, type: image.type, data: image.bytes.toString('base64') });
  }
  const assetPaths = [];
  const assetDir = path.join(blog, 'img', 'article-studio', filename.slice(0, -3));
  for (const [i, asset] of incomingAssets.entries()) {
    if (i >= 30) throw new Error('单篇最多导入 30 张图片');
    const ext = allowedExt.get(asset.type);
    if (!ext || typeof asset.data !== 'string' || typeof asset.name !== 'string') throw new Error('图片格式不支持');
    const bytes = Buffer.from(asset.data, 'base64');
    if (bytes.length > 5 * 1024 * 1024 || bytes.length === 0) throw new Error('单张图片不能超过 5 MB');
    const base = slugify(path.basename(asset.name, path.extname(asset.name))) || `image-${i + 1}`;
    const name = existing ? `${String(i + 1).padStart(2, '0')}-${base}-${randomUUID().slice(0, 8)}${ext}` : `${String(i + 1).padStart(2, '0')}-${base}${ext}`;
    const webPath = `/img/article-studio/${filename.slice(0, -3)}/${name}`;
    imageMap.set(asset.name.replace(/^\.\//, ''), webPath);
    imageMap.set(path.basename(asset.name), webPath);
    assetPaths.push({ file: path.join(assetDir, name), bytes });
  }
  const missingLocal = bodyRefs.filter(ref => !/^https?:\/\//i.test(ref) && !ref.startsWith('/img/') && !imageMap.has(ref.replace(/^\.\//, '')) && !imageMap.has(path.basename(ref)));
  if (missingLocal.length) throw new Error(`这些本地图片尚未添加：${missingLocal.slice(0, 3).join('、')}`);
  const normalized = normalizeImageLinks(body, imageMap);
  const sourceNote = formatBlogSourceFootnote({ title, url: sourceHref });
  const priorQr = existing?.body.match(/!\[公众号二维码\]\((\/img\/article-studio\/[^)]+)\)/)?.[1] || null;
  const qrPath = data.qrImageName ? imageMap.get(String(data.qrImageName)) : priorQr;
  const wechatName = String(data.wechatName || '').trim().replace(/^公众号\s*[：:]?\s*/, '').slice(0, 60);
  const footer = data.footer ? `\n\n---\n\n**关于我**  \n旅行、跑步、看书，也喜欢 AI 和数码  \n🌍 30+ 国家 · 🏅 半马 1h36 ｜ 全马 3h58  \n[主页 scond.me](https://scond.me)\n${wechatName ? `\n欢迎关注公众号：${wechatName}\n` : ''}${qrPath ? `\n![公众号二维码](${qrPath})\n` : ''}` : '';
  const frontmatter = [
    '---', 'layout: post', `title: ${yamlString(title)}`, `date: ${date}`, 'author: Scond', `article_style: ${style}`, `article_font_size: ${fontSize}`, 'article_studio: true',
    ...(sourceHref ? [`source_account: ${yamlString(sourceAccount)}`, `source_url: ${yamlString(sourceHref)}`, ...(sourcePublishedAt ? [`source_published_at: ${yamlString(sourcePublishedAt)}`] : [])] : []),
    'tags:', ...tags.map(t => `  - ${yamlString(t)}`), '---', ''
  ].join('\n');
  await fs.mkdir(posts, { recursive: true });
  if (assetPaths.length) await fs.mkdir(assetDir, { recursive: true });
  const tempPath = existing ? path.join(posts, `.${filename}.${randomUUID()}.tmp`) : null;
  try {
    for (const asset of assetPaths) await fs.writeFile(asset.file, asset.bytes, { flag: 'wx' });
    const content = `${frontmatter}${normalized}${sourceNote ? `\n\n${sourceNote}` : ''}${footer}\n`;
    if (existing) {
      await fs.writeFile(tempPath, content, { flag: 'wx' });
      await fs.rename(tempPath, filepath);
    } else await fs.writeFile(filepath, content, { flag: 'wx' });
  } catch (e) {
    await Promise.all(assetPaths.map(x => fs.rm(x.file, { force: true })));
    if (tempPath) await fs.rm(tempPath, { force: true });
    throw e;
  }
  return { filename, revision: (await readStudioPost(filename, posts)).revision, markdown: normalized, qrPath: data.footer ? qrPath : '', assets: assetPaths.map(x => path.relative(blog, x.file)), previewUrl: `https://blog.scond.me/${filename.slice(0, 10).replace(/-/g, '/')}/${encodeURIComponent(filename.slice(11, -3))}/` };
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  return !origin || origin === `http://${host}:${port}` || origin === 'http://127.0.0.1:5173';
}
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
http.createServer(async (req, res) => {
  try {
    if (!sameOrigin(req)) return json(res, 403, { error: '只接受本地页面请求' });
    if (req.url === '/api/config' && req.method === 'GET') return json(res, 200, { imageDirectory: DEFAULT_IMAGES });
    if (req.url === '/api/source-folders' && req.method === 'GET') return json(res, 200, { root: OBSIDIAN_ROOT, folders: await listSourceFolders() });
    if (req.url?.startsWith('/api/source-location?') && req.method === 'GET') return json(res, 200, await locateSourceFolder(new URL(req.url, `http://${host}:${port}`).searchParams.get('filename')));
    if (req.url === '/api/save-source' && req.method === 'POST') return json(res, 200, await saveSourceDraft(await requestBody(req), { root: OBSIDIAN_ROOT, blogImages: path.join(blog, 'img') }));
    if (req.url?.startsWith('/api/studio-posts') && req.method === 'GET') return json(res, 200, await listManagedPosts({ ...publishing, refresh: new URL(req.url, `http://${host}:${port}`).searchParams.get('refresh') === '1' }));
    if (req.url?.startsWith('/api/studio-post?') && req.method === 'GET') return json(res, 200, await readManagedPost(new URL(req.url, `http://${host}:${port}`).searchParams.get('filename'), publishing));
    if (req.url?.startsWith('/api/blog-preview?') && req.method === 'GET') return json(res, 200, await previewBlogPost(new URL(req.url, `http://${host}:${port}`).searchParams.get('filename')));
    if (req.url === '/api/restore-studio-post' && req.method === 'POST') return json(res, 200, await restoreManagedPost((await requestBody(req)).filename, publishing));
    if (req.url === '/api/delete-studio-post' && req.method === 'POST') {
      const data = await requestBody(req);
      return json(res, 200, await deleteStudioPost(data.filename, data.expectedRevision, posts));
    }
    if (req.url === '/api/resolve-images' && req.method === 'POST') {
      const data = await requestBody(req);
      return json(res, 200, await resolveImages(data.markdown, data.directory));
    }
    if (req.url?.startsWith('/api/local-image?') && req.method === 'GET') {
      const image = await readGrantedImage(new URL(req.url, `http://${host}:${port}`).searchParams.get('id'));
      res.writeHead(200, { 'content-type': image.type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      return res.end(image.bytes);
    }
    if (req.url === '/api/health' && req.method === 'GET') return json(res, 200, { app: 'scond-article-studio' });
    if (req.url === '/api/save' && req.method === 'POST') return json(res, 200, await savePost(await requestBody(req)));
    if (req.url === '/api/publish' && req.method === 'POST') {
      const data = await requestBody(req);
      return json(res, 200, await publishManagedPost(data.filename, data.revision, publishing));
    }
    if (req.url === '/api/unpublish' && req.method === 'POST') {
      const data = await requestBody(req);
      return json(res, 200, await unpublishManagedPost(data.filename, data.remoteRevision, publishing));
    }
    if (req.url?.startsWith('/api/')) return json(res, 404, { error: '接口不存在' });
    if (req.method !== 'GET') return json(res, 405, { error: '方法不支持' });
    if (req.url?.startsWith('/img/')) {
      const imagesRoot = await fs.realpath(path.join(blog, 'img'));
      const name = decodeURIComponent(req.url.split('?')[0].slice(5));
      const file = await fs.realpath(path.resolve(imagesRoot, name)).catch(() => null);
      const type = new Map([['.png','image/png'],['.jpg','image/jpeg'],['.jpeg','image/jpeg'],['.webp','image/webp'],['.gif','image/gif']]).get(path.extname(name).toLowerCase());
      if (!file || !file.startsWith(imagesRoot + path.sep) || !type || !(await fs.stat(file)).isFile()) return json(res, 404, { error: '图片不存在' });
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      return res.end(await fs.readFile(file));
    }
    const root = path.join(here, 'public');
    const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
    const requested = path.resolve(root, `.${pathname}`);
    const file = requested.startsWith(root + path.sep) && (await fs.stat(requested).catch(() => null))?.isFile() ? requested : path.join(root, 'index.html');
    const bytes = await fs.readFile(file);
    res.writeHead(200, { 'content-type': `${mime[path.extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'cache-control': 'no-store' });
    res.end(bytes);
  } catch (e) { json(res, 400, { error: e.message || '操作失败' }); }
}).on('error', error => {
  if (error.code === 'EADDRINUSE') console.error(`${port} 端口已被占用，请关闭占用端口的程序后重试。`);
  else console.error(`启动失败：${error.message}`);
  process.exitCode = 1;
}).listen(port, host, () => console.log(`文章排版工作台：http://${host}:${port}`));
