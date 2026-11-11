import fs from 'node:fs/promises';
import path from 'node:path';
import { OBSIDIAN_ROOT, resolveImages, imageReferences } from './local-images.mjs';
import { imageLabel } from './public/image-sizing.js';

const imageTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const within = (root, file) => file === root || file.startsWith(root + path.sep);
const cleanRef = value => { try { return decodeURIComponent(value); } catch { return value; } };

export async function listSourceFolders(root = OBSIDIAN_ROOT) {
  const base = await fs.realpath(root);
  const folders = ['.'];
  async function visit(directory, depth) {
    if (depth > 3) return;
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.isSymbolicLink() || entry.name.startsWith('.') || entry.name === 'Assets') continue;
      const full = path.join(directory, entry.name);
      folders.push(path.relative(base, full).split(path.sep).join('/'));
      await visit(full, depth + 1);
    }
  }
  await visit(base, 1);
  return folders;
}

export async function locateSourceFolder(filename, root = OBSIDIAN_ROOT) {
  if (typeof filename !== 'string' || path.basename(filename) !== filename || !/\.md$/i.test(filename)) return { folder: '.', matches: [] };
  const base = await fs.realpath(root);
  const folders = await listSourceFolders(base);
  const matches = [];
  for (const folder of folders) {
    const file = path.join(base, folder, filename);
    if ((await fs.stat(file).catch(() => null))?.isFile()) matches.push(folder);
  }
  return { folder: matches.length === 1 ? matches[0] : '.', matches };
}

function rewriteImages(markdown, map) {
  return markdown.replace(/!\[([^\]]*)\]\((<[^>]+>|[^)]+)\)|!\[\[([^\]]+)\]\]/g, (all, alt, target, wiki) => {
    const raw = cleanRef((target || wiki).split('|')[0].trim().replace(/^<|>$/g, '')).replace(/^\.\//, '');
    const replacement = map.get(raw);
    if (!replacement) return all;
    const wikiSize = wiki?.includes('|') ? wiki.split('|').at(-1) : '';
    const sized = imageLabel(`${path.basename(raw)}|${wikiSize}`);
    const name = alt || (sized.width ? `${sized.alt}|${sized.width}${sized.height ? `x${sized.height}` : ''}` : path.basename(raw));
    return `![${name}](<${replacement}>)`;
  });
}

export async function saveSourceDraft(data, { root = OBSIDIAN_ROOT, blogImages = path.resolve('img') } = {}) {
  const base = await fs.realpath(root);
  const folderName = String(data.folder || '.');
  if (folderName === 'Assets' || folderName.startsWith('Assets/')) throw new Error('Markdown 不能保存在 Assets 图片目录');
  const proposed = path.resolve(base, folderName);
  if (!within(base, proposed)) throw new Error('只能保存到 Obsidian Blog 内的文件夹');
  const folder = await fs.realpath(proposed).catch(() => { throw new Error('找不到要保存的 Obsidian 文件夹'); });
  if (!within(base, folder) || !(await fs.stat(folder)).isDirectory()) throw new Error('只能保存到 Obsidian Blog 内的文件夹');
  const filename = String(data.filename || '').trim();
  const markdown = String(data.markdown || '').trim();
  if (!filename || path.basename(filename) !== filename || !filename.toLowerCase().endsWith('.md') || filename.startsWith('.') || /[\\/\r\n]/.test(filename)) throw new Error('请输入有效的 .md 文件名');
  if (!markdown || markdown.length > 300000) throw new Error('文章为空或过长');

  const refs = imageReferences(markdown);
  const uploads = new Map();
  for (const asset of Array.isArray(data.assets) ? data.assets : []) {
    if (typeof asset.name !== 'string' || typeof asset.data !== 'string' || !Object.values(imageTypes).includes(asset.type)) throw new Error('图片格式不支持');
    const bytes = Buffer.from(asset.data, 'base64');
    if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('单张图片不能超过 5 MB');
    uploads.set(cleanRef(asset.name).replace(/^\.\//, ''), { bytes, type: asset.type });
  }
  const assetsDir = await fs.realpath(path.join(base, 'Assets')).catch(() => { throw new Error('找不到 Obsidian Assets 图片目录'); });
  if (!within(base, assetsDir) || !(await fs.stat(assetsDir)).isDirectory()) throw new Error('Assets 图片目录必须位于 Obsidian Blog 内');
  const found = await resolveImages(markdown, assetsDir, base);
  const foundByRef = new Map(found.assets.map(asset => [asset.ref.replace(/^\.\//, ''), asset]));
  const replacements = new Map();
  const newlyWritten = [];
  async function putImage(originalName, bytes, type) {
    const ext = path.extname(originalName).toLowerCase();
    if (imageTypes[ext] !== type) throw new Error(`图片类型与扩展名不符：${originalName}`);
    const stem = path.basename(originalName, ext).replace(/[^\p{L}\p{N}._-]+/gu, '-').slice(0, 80) || '图片';
    for (let number = 1; number <= 100; number++) {
      const name = `${stem}${number === 1 ? '' : `-${number}`}${ext}`;
      const target = path.join(assetsDir, name);
      const real = await fs.realpath(target).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
      if (real && !within(assetsDir, real)) throw new Error(`图片位置超出 Assets：${name}`);
      const existing = await fs.readFile(target).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
      if (existing?.equals(bytes)) return target;
      if (existing) continue;
      try { await fs.writeFile(target, bytes, { flag: 'wx' }); newlyWritten.push(target); return target; }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    throw new Error('图片同名文件过多，请重命名后重试');
  }
  try {
    for (const ref of refs) {
      if (/^(?:https?:|data:|blob:)/i.test(ref)) continue;
      let target;
      const upload = uploads.get(ref.replace(/^\.\//, '')) || uploads.get(path.basename(ref));
      if (upload) target = await putImage(path.basename(ref), upload.bytes, upload.type);
      else if (ref.startsWith('/img/')) {
        const image = await fs.realpath(path.resolve(blogImages, `.${ref.slice(4)}`)).catch(() => null);
        const imagesRoot = await fs.realpath(blogImages);
        if (!image || !within(imagesRoot, image) || !imageTypes[path.extname(image).toLowerCase()]) throw new Error(`找不到博客图片：${ref}`);
        const bytes = await fs.readFile(image);
        if (bytes.length > 5 * 1024 * 1024) throw new Error(`图片超过 5 MB：${ref}`);
        target = await putImage(path.basename(image), bytes, imageTypes[path.extname(image).toLowerCase()]);
      } else {
        const asset = foundByRef.get(ref.replace(/^\.\//, ''));
        if (!asset) throw new Error(`图片尚未关联：${ref}`);
        target = path.join(base, asset.relativePath);
      }
      replacements.set(ref.replace(/^\.\//, ''), path.relative(folder, target).split(path.sep).join('/'));
    }
    const output = `${rewriteImages(markdown, replacements).trim()}\n`;
    const stem = filename.slice(0, -3);
    for (let number = 1; number <= 100; number++) {
      const name = `${stem}${number === 1 ? '' : `-${number}`}.md`;
      try {
        await fs.writeFile(path.join(folder, name), output, { flag: 'wx' });
        return { filename: name, folder: folderName, path: path.join(folder, name), images: newlyWritten.length };
      } catch (error) { if (error.code !== 'EEXIST') throw error; }
    }
    throw new Error('同名 Markdown 文件过多，请换一个文件名');
  } catch (error) {
    await Promise.all(newlyWritten.map(file => fs.rm(file, { force: true })));
    throw error;
  }
}
