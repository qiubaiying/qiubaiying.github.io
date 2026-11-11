import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { marked } from './public/vendor/marked.esm.js';

export const OBSIDIAN_ROOT = path.join(os.homedir(), 'Documents', 'Obsidian Vault', 'Blog');
export const DEFAULT_IMAGES = path.join(OBSIDIAN_ROOT, 'Assets');
const imageTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const granted = new Map();
const pathIds = new Map();
const within = (root, file) => file === root || file.startsWith(root + path.sep);
export const decodeRef = ref => { try { return decodeURIComponent(ref); } catch { return ref; } };
export function imageReferences(markdown) {
  const refs = [];
  const text = markdown.replace(/!\[\[([^\]]+)\]\]/g, (_, s) => `![图片](<${s.split('|')[0]}>)`);
  marked.walkTokens(marked.lexer(text), token => { if (token.type === 'image') refs.push(decodeRef(token.href)); });
  return [...new Set(refs)];
}
export async function resolveImages(markdown, directory = DEFAULT_IMAGES, allowedRoot = OBSIDIAN_ROOT) {
  if (typeof markdown !== 'string' || markdown.length > 300000) throw new Error('文章过长或格式错误');
  const root = await fs.realpath(allowedRoot).catch(() => { throw new Error('找不到 Obsidian Blog 文件夹，请检查路径'); });
  const folder = await fs.realpath(directory || DEFAULT_IMAGES).catch(() => { throw new Error('找不到图片文件夹，请检查地址'); });
  if (!within(root, folder) || !(await fs.stat(folder)).isDirectory()) throw new Error('图片目录必须位于已关联的 Obsidian Blog 文件夹内');
  const refs = imageReferences(markdown).filter(ref => !/^(https?:|data:|blob:|\/img\/)/i.test(ref));
  const assets = [], missing = [];
  let index;
  async function buildIndex(dir, map = new Map()) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await buildIndex(full, map);
      else if (entry.isFile() && imageTypes[path.extname(entry.name).toLowerCase()]) map.set(entry.name, [...(map.get(entry.name) || []), full]);
    }
    return map;
  }
  for (const ref of refs) {
    let found;
    const candidates = [path.resolve(folder, ref), path.resolve(root, ref.replace(/^(?:\.\.\/)+/, ''))];
    for (const candidate of candidates) {
      const real = await fs.realpath(candidate).catch(() => null);
      if (real && within(root, real) && (await fs.stat(real)).isFile()) { found = real; break; }
    }
    if (!found) {
      index ||= await buildIndex(folder);
      const matches = index.get(path.basename(ref)) || [];
      if (matches.length === 1) found = matches[0];
      else if (matches.length > 1) { missing.push({ ref, reason: '有多个同名图片，请使用含子文件夹的路径' }); continue; }
    }
    const type = found && imageTypes[path.extname(found).toLowerCase()];
    if (!found || !type) { missing.push({ ref, reason: '未找到或格式不支持' }); continue; }
    const stat = await fs.stat(found);
    if (stat.size > 5 * 1024 * 1024) { missing.push({ ref, reason: '超过单张 5 MB 上限' }); continue; }
    const id = pathIds.get(found) || randomUUID();
    pathIds.set(found, id); granted.set(id, { path: found, root, type });
    assets.push({ ref, id, type, size: stat.size, url: `/api/local-image?id=${id}`, relativePath: path.relative(root, found).split(path.sep).join('/') });
  }
  return { assets, missing };
}
export async function readGrantedImage(id) {
  const item = granted.get(id);
  if (!item) throw new Error('图片关联已过期，请重新关联图片');
  const real = await fs.realpath(item.path);
  if (!within(item.root, real) || imageTypes[path.extname(real).toLowerCase()] !== item.type) throw new Error('图片不在已关联文件夹内');
  if ((await fs.stat(real)).size > 5 * 1024 * 1024) throw new Error('图片超过 5 MB');
  return { type: item.type, bytes: await fs.readFile(real) };
}
