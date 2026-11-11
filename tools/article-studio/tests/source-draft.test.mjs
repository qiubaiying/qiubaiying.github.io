import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { listSourceFolders, locateSourceFolder, saveSourceDraft } from '../source-draft.mjs';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL3WQAAAABJRU5ErkJggg==', 'base64');

test('locates original folder and saves an edited copy with working image paths', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-source-'));
  const root = path.join(temp, 'Blog');
  const draft = path.join(root, '02-草稿');
  const assets = path.join(root, 'Assets');
  const blogImages = path.join(temp, 'blog-images');
  try {
    await Promise.all([fs.mkdir(draft, { recursive: true }), fs.mkdir(assets, { recursive: true }), fs.mkdir(blogImages)]);
    await fs.writeFile(path.join(draft, '原稿.md'), '# 原稿\n');
    await fs.writeFile(path.join(assets, '旧图.png'), png);
    assert.deepEqual(await listSourceFolders(root), ['.', '02-草稿']);
    assert.deepEqual(await locateSourceFolder('原稿.md', root), { folder: '02-草稿', matches: ['02-草稿'] });
    const input = { folder: '02-草稿', filename: '原稿-排版版.md', markdown: '# 新稿\n\n![旧图](../Assets/旧图.png)\n\n![[旧图.png|482]]\n\n![新图](new.png)', assets: [{ name: 'new.png', type: 'image/png', data: png.toString('base64') }] };
    const first = await saveSourceDraft(input, { root, blogImages });
    assert.equal(first.filename, '原稿-排版版.md');
    const saved = await fs.readFile(first.path, 'utf8');
    assert.match(saved, /!\[旧图\]\(<\.\.\/Assets\/旧图\.png>\)/);
    assert.match(saved, /!\[旧图\.png\|482\]\(<\.\.\/Assets\/旧图\.png>\)/);
    assert.match(saved, /!\[新图\]\(<\.\.\/Assets\/new\.png>\)/);
    assert.deepEqual(await fs.readFile(path.join(draft, '原稿.md'), 'utf8'), '# 原稿\n');
    assert.deepEqual(await fs.readFile(path.join(assets, 'new.png')), png);
    const second = await saveSourceDraft(input, { root, blogImages });
    assert.equal(second.filename, '原稿-排版版-2.md');
    assert.equal(second.images, 0);
    await assert.rejects(saveSourceDraft({ ...input, folder: '../outside' }, { root, blogImages }), /只能保存到 Obsidian Blog/);
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
});
