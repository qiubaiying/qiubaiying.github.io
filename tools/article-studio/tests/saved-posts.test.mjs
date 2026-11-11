import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { listStudioPosts, readStudioPost, deleteStudioPost } from '../saved-posts.mjs';

test('lists and previews only posts saved by the studio', async () => {
  const posts = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-posts-'));
  try {
    const name = '2026-09-28-测试文章.md';
    await fs.writeFile(path.join(posts, name), '---\nlayout: post\ntitle: "测试文章"\ndate: 2026-09-28\narticle_studio: true\narticle_style: warm\narticle_font_size: 18\nsource_account: "Scond"\nsource_url: "https://mp.weixin.qq.com/s/abc"\ntags:\n  - "跑步"\n---\n正文内容。\n');
    await fs.writeFile(path.join(posts, '2026-09-27-旧文章.md'), '---\ntitle: 旧文章\n---\n其他内容。\n');
    const list = await listStudioPosts(posts);
    assert.equal(list.length, 1);
    assert.equal(list[0].title, '测试文章');
    const post = await readStudioPost(name, posts);
    assert.equal(post.body, '正文内容。');
    assert.equal(post.style, 'warm');
    assert.equal(post.fontSize, 18);
    assert.deepEqual(post.tags, ['跑步']);
    assert.deepEqual(post.source, { account: 'Scond', publishedAt: '', url: 'https://mp.weixin.qq.com/s/abc' });
    assert.match(post.revision, /^[a-f0-9]{64}$/);
    await assert.rejects(deleteStudioPost(name, 'old-revision', posts), /已被其他操作修改/);
    assert.equal((await readStudioPost(name, posts)).title, '测试文章');
    await assert.rejects(readStudioPost('../secret.md', posts), /文件名无效/);
    await deleteStudioPost(name, post.revision, posts);
    await assert.rejects(readStudioPost(name, posts), /找不到这篇文章/);
  } finally { await fs.rm(posts, { recursive: true, force: true }); }
});
