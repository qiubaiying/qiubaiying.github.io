import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { deleteStudioPost, readStudioPost } from '../saved-posts.mjs';
import { listManagedPosts, publishManagedPost, readManagedPost, restoreManagedPost, unpublishManagedPost } from '../post-publishing.mjs';

test('publishes, updates, restores and unpublishes only the selected article', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-publishing-'));
  const repo = path.join(temp, 'blog');
  const remote = path.join(temp, 'remote.git');
  const postsDir = path.join(repo, '_posts');
  const filename = '2026-09-28-测试发布.md';
  const file = path.join(postsDir, filename);
  const imagePath = `img/article-studio/${filename.slice(0, -3)}/cover.png`;
  let builds = 0;
  const options = { repo, postsDir, expectedRemote: remote, preflight: async () => { builds++; } };
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const content = body => `---\nlayout: post\ntitle: "测试发布"\ndate: 2026-09-28\narticle_studio: true\narticle_style: sage\narticle_font_size: 16\n---\n${body}\n\n![配图](/${imagePath})\n`;
  try {
    await fs.mkdir(repo);
    execFileSync('git', ['init', '--bare', remote], { stdio: 'ignore' });
    git('init', '-b', 'master');
    git('config', 'user.name', 'Studio Test');
    git('config', 'user.email', 'studio@example.invalid');
    git('remote', 'add', 'origin', remote);
    await fs.writeFile(path.join(repo, 'README.md'), 'test\n');
    git('add', '--', 'README.md'); git('commit', '-m', 'initial'); git('push', '-u', 'origin', 'master');
    await fs.mkdir(path.join(repo, 'tools', 'article-studio'), { recursive: true });
    await fs.writeFile(path.join(repo, 'tools', 'article-studio', 'layout.css'), 'body {}\n');
    git('add', '--', 'tools/article-studio/layout.css'); git('commit', '-m', 'Simplify article studio layout and actions');
    await fs.mkdir(postsDir);
    await fs.mkdir(path.dirname(path.join(repo, imagePath)), { recursive: true });
    await fs.writeFile(path.join(repo, imagePath), 'test image');
    await fs.writeFile(file, content('初稿'));
    let post = await readStudioPost(filename, postsDir);
    const localListing = (await listManagedPosts({ ...options, refresh: true })).posts[0];
    assert.equal(localListing.status, 'local');
    assert.equal(localListing.localPath, file);
    await publishManagedPost(filename, post.revision, options);
    assert.equal(builds, 1);
    let catalog = await listManagedPosts({ ...options, refresh: true });
    assert.equal(catalog.posts[0].status, 'synced');
    assert.match(git('show', `origin/master:_posts/${filename}`), /初稿/);
    assert.equal(git('show', `origin/master:${imagePath}`), 'test image');

    await fs.writeFile(file, content('修改后的文章'));
    post = await readStudioPost(filename, postsDir);
    catalog = await listManagedPosts({ ...options, refresh: true });
    assert.equal(catalog.posts[0].status, 'needs_sync');
    await publishManagedPost(filename, post.revision, options);
    assert.match(git('show', `origin/master:_posts/${filename}`), /修改后的文章/);

    await deleteStudioPost(filename, post.revision, postsDir);
    catalog = await listManagedPosts({ ...options, refresh: true });
    assert.equal(catalog.posts[0].status, 'remote_only');
    assert.equal(catalog.posts[0].localPath, '');
    assert.match((await readManagedPost(filename, options)).body, /^修改后的文章/);
    await restoreManagedPost(filename, options);
    assert.match((await readStudioPost(filename, postsDir)).body, /^修改后的文章/);

    await unpublishManagedPost(filename, catalog.posts[0].remoteRevision, options);
    catalog = await listManagedPosts({ ...options, refresh: true });
    assert.equal(catalog.posts[0].status, 'local');
    assert.equal(await fs.readFile(file, 'utf8'), content('修改后的文章'));
    assert.throws(() => git('show', `origin/master:_posts/${filename}`));

    post = await readStudioPost(filename, postsDir);
    await publishManagedPost(filename, post.revision, options);
    await deleteStudioPost(filename, post.revision, postsDir);
    catalog = await listManagedPosts({ ...options, refresh: true });
    assert.equal(catalog.posts[0].status, 'remote_only');
    await unpublishManagedPost(filename, catalog.posts[0].remoteRevision, options);
    assert.equal((await listManagedPosts({ ...options, refresh: true })).posts[0].status, 'local');
    assert.match((await readStudioPost(filename, postsDir)).body, /^修改后的文章/);

    await fs.writeFile(path.join(repo, 'README.md'), 'unrelated change\n');
    git('add', '--', 'README.md'); git('commit', '-m', 'unrelated change');
    await assert.rejects(publishManagedPost(filename, (await readStudioPost(filename, postsDir)).revision, options), /其他未推送提交/);
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
});
