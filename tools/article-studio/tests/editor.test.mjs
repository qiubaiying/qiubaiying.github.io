import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { formatSelection } from '../public/editor-actions.js';
import { resolveImages, readGrantedImage, imageReferences } from '../local-images.mjs';

test('selected text formats and toggles without changing surrounding text', () => {
  for (const format of ['bold','italic','underline','strike']) {
    const text = '开头需要强调结尾';
    const result = formatSelection(text, 2, 6, format);
    assert.equal(result.text.slice(result.start, result.end), '需要强调');
    const restored = formatSelection(result.text, result.start, result.end, format);
    assert.equal(restored.text, text);
  }
  const blank = formatSelection('', 0, 0, 'bold');
  assert.equal(blank.text.slice(blank.start, blank.end), '在这里输入文字');
  assert.equal(formatSelection('甲\n乙\n丙', 0, 3, 'list').text, '- 甲\n- 乙\n丙');
});

test('Obsidian relative, wiki, encoded and spaced images resolve within the selected folder', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-images-'));
  try {
    await fs.mkdir(path.join(root,'Assets'));
    await fs.writeFile(path.join(root,'Assets','示例 image.png'), 'test-image-bytes');
    const md = '![[示例 image.png|300]]\n\n![图](../Assets/%E7%A4%BA%E4%BE%8B%20image.png)\n\n![图](<Assets/示例 image.png>)';
    assert.equal(imageReferences(md).length, 3);
    const result = await resolveImages(md,path.join(root,'Assets'),root);
    assert.equal(result.assets.length,3);
    assert.deepEqual(result.missing,[]);
    assert.equal((await readGrantedImage(result.assets[0].id)).bytes.toString(),'test-image-bytes');
    const missing = await resolveImages('![[missing.png]]',path.join(root,'Assets'),root);
    assert.equal(missing.missing.length,1);
    await assert.rejects(resolveImages(md,path.dirname(root),root),/必须位于/);
    await fs.symlink('/etc/hosts',path.join(root,'Assets','escape.png'));
    assert.equal((await resolveImages('![[escape.png]]',path.join(root,'Assets'),root)).assets.length,0);
  } finally { await fs.rm(root,{recursive:true,force:true}); }
});
