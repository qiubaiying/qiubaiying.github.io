import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { sourceFromMeta } from './public/blog-source.js';

const revisionOf = content => createHash('sha256').update(content).digest('hex');

export function parseStudioPost(content, filename) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match || !/^article_studio:\s*true\s*$/m.test(match[1])) return null;
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const found = line.match(/^([\w-]+):\s*(.*)$/);
    if (!found) continue;
    try { meta[found[1]] = JSON.parse(found[2]); }
    catch { meta[found[1]] = found[2].replace(/^['"]|['"]$/g, ''); }
  }
  return {
    filename,
    title: String(meta.title || filename.replace(/\.md$/i, '')),
    date: String(meta.date || filename.slice(0, 10)),
    style: ['sage','classic','modern','literary','warm','minimal'].includes(meta.article_style) ? meta.article_style : 'sage',
    fontSize: [14,16,18,20,22].includes(Number(meta.article_font_size)) ? Number(meta.article_font_size) : 16,
    tags: [...match[1].matchAll(/^\s+-\s+(.+)$/gm)].map(([, value]) => { try { return String(JSON.parse(value)); } catch { return value.replace(/^['"]|['"]$/g, ''); } }),
    source: sourceFromMeta(meta),
    body: content.slice(match[0].length).trim(),
    revision: revisionOf(content)
  };
}

export async function readStudioPost(filename, postsDir) {
  if (typeof filename !== 'string' || path.basename(filename) !== filename || !/^\d{4}-\d{2}-\d{2}-.+\.md$/.test(filename)) throw new Error('文章文件名无效');
  const root = await fs.realpath(postsDir);
  const file = await fs.realpath(path.join(root, filename)).catch(() => { throw new Error('找不到这篇文章'); });
  if (!file.startsWith(root + path.sep)) throw new Error('文章位置无效');
  const post = parseStudioPost(await fs.readFile(file, 'utf8'), filename);
  if (!post) throw new Error('这篇文章不是排版工具保存的');
  return post;
}

export async function listStudioPosts(postsDir) {
  const entries = await fs.readdir(postsDir, { withFileTypes: true });
  const posts = await Promise.all(entries.filter(entry => entry.isFile() && /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(entry.name)).map(async entry => {
    const content = await fs.readFile(path.join(postsDir, entry.name), 'utf8');
    const post = parseStudioPost(content, entry.name);
    if (!post) return null;
    const stat = await fs.stat(path.join(postsDir, entry.name));
    return { filename: post.filename, title: post.title, date: post.date, savedAt: stat.mtime.toISOString(), revision: post.revision };
  }));
  return posts.filter(Boolean).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function deleteStudioPost(filename, expectedRevision, postsDir) {
  const post = await readStudioPost(filename, postsDir);
  if (post.revision !== expectedRevision) throw new Error('文章已被其他操作修改，请刷新清单后再删除');
  await fs.unlink(path.join(postsDir, filename));
  return { filename };
}
