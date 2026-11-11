import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { listStudioPosts, parseStudioPost, readStudioPost } from './saved-posts.mjs';

const postName = filename => typeof filename === 'string' && path.basename(filename) === filename && /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(filename);
const postPath = filename => `_posts/${filename}`;
const imageDirectory = filename => `img/article-studio/${filename.slice(0, -3)}/`;
const postUrl = filename => `https://blog.scond.me/${filename.slice(0, 10).replace(/-/g, '/')}/${encodeURIComponent(filename.slice(11, -3))}/`;
const within = (root, file) => file.startsWith(root + path.sep);

export function runGit(repo, args, { raw = false, timeout = 12000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, { cwd: repo, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '', settled = false;
    const timer = setTimeout(() => child.kill(), timeout);
    child.stdout.on('data', part => out += part);
    child.stderr.on('data', part => err += part);
    child.on('error', finish);
    child.on('close', code => finish(code === 0 ? null : new Error(err.trim() || `Git 命令失败 (${code})`)));
    function finish(error) {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (error) reject(error);
      else resolve(raw ? out : out.trim());
    }
  });
}

async function checkRemote(repo, expectedRemote) {
  const remote = await runGit(repo, ['remote', 'get-url', 'origin']);
  if (typeof expectedRemote === 'string' ? remote !== expectedRemote : !expectedRemote.test(remote)) throw new Error('博客远端地址与预期不符，已停止操作');
}

async function fetchRemote(repo, expectedRemote) {
  await checkRemote(repo, expectedRemote);
  await runGit(repo, ['fetch', '--quiet', 'origin', 'master'], { timeout: 30000 });
}

async function remotePosts(repo) {
  const names = (await runGit(repo, ['ls-tree', '-r', '-z', '--name-only', 'origin/master', '--', '_posts'], { raw: true })).split('\0').filter(Boolean);
  const found = new Map();
  for (const rel of names) {
    if (!rel.startsWith('_posts/') || !postName(rel.slice(7))) continue;
    const content = await runGit(repo, ['show', `origin/master:${rel}`], { raw: true });
    const post = parseStudioPost(content, rel.slice(7));
    if (post) found.set(post.filename, post);
  }
  return found;
}

async function remoteHasAssets(repo, post) {
  const prefix = `/${imageDirectory(post.filename)}`;
  const refs = [...post.body.matchAll(/!\[[^\]]*\]\((\/img\/article-studio\/[^)]+)\)/g)].map(([, ref]) => decodeURIComponent(ref));
  for (const ref of refs) {
    if (!ref.startsWith(prefix)) continue;
    try { await runGit(repo, ['cat-file', '-e', `origin/master:${ref.slice(1)}`]); }
    catch { return false; }
  }
  return true;
}

export async function listManagedPosts({ repo, postsDir = path.join(repo, '_posts'), expectedRemote, refresh = true }) {
  let remoteError = '';
  if (refresh) try { await fetchRemote(repo, expectedRemote); } catch (error) { remoteError = error.message; }
  const local = await listStudioPosts(postsDir);
  let online = new Map();
  try { online = await remotePosts(repo); } catch (error) { remoteError ||= error.message; }
  const localByName = new Map(local.map(post => [post.filename, post]));
  const rows = [];
  for (const filename of new Set([...localByName.keys(), ...online.keys()])) {
    const here = localByName.get(filename);
    const remote = online.get(filename);
    let status = here && remote ? here.revision === remote.revision && await remoteHasAssets(repo, remote) ? 'synced' : 'needs_sync' : here ? 'local' : 'remote_only';
    if (remoteError) status = 'unverified';
    rows.push({ filename, title: here?.title || remote.title, date: here?.date || remote.date, savedAt: here?.savedAt || '', revision: here?.revision || remote.revision, remoteRevision: remote?.revision || '', localExists: Boolean(here), localPath: here ? path.join(postsDir, filename) : '', remoteExists: Boolean(remote), status, url: postUrl(filename) });
  }
  rows.sort((a, b) => (b.savedAt || b.date).localeCompare(a.savedAt || a.date));
  return { posts: rows, remoteError };
}

export async function readManagedPost(filename, { repo, postsDir = path.join(repo, '_posts') }) {
  if (!postName(filename)) throw new Error('文章文件名无效');
  try { return await readStudioPost(filename, postsDir); }
  catch (error) { if (error.message !== '找不到这篇文章') throw error; }
  const content = await runGit(repo, ['show', `origin/master:${postPath(filename)}`], { raw: true }).catch(() => { throw new Error('找不到这篇文章'); });
  const post = parseStudioPost(content, filename);
  if (!post) throw new Error('这篇文章不是排版工具保存的');
  return post;
}

export async function restoreManagedPost(filename, { repo, postsDir = path.join(repo, '_posts'), expectedRemote }) {
  if (!postName(filename)) throw new Error('文章文件名无效');
  await fetchRemote(repo, expectedRemote);
  const content = await runGit(repo, ['show', `origin/master:${postPath(filename)}`], { raw: true }).catch(() => { throw new Error('线上仓库找不到这篇文章'); });
  if (!parseStudioPost(content, filename)) throw new Error('线上文章不是排版工具保存的');
  await fs.writeFile(path.join(postsDir, filename), content, { flag: 'wx' });
  return readStudioPost(filename, postsDir);
}

async function publishChecks(repo, filename, expectedRemote) {
  if (!postName(filename)) throw new Error('文章文件名无效');
  if (await runGit(repo, ['branch', '--show-current']) !== 'master') throw new Error('请在博客 master 分支操作');
  await fetchRemote(repo, expectedRemote);
  if (Number(await runGit(repo, ['rev-list', '--count', 'HEAD..origin/master']))) throw new Error('线上仓库有新提交，请先同步博客仓库');
  const commits = (await runGit(repo, ['log', '--format=%H%x09%s', 'origin/master..HEAD'])).split('\n').filter(Boolean).map(line => { const [sha, ...subject] = line.split('\t'); return { sha, subject: subject.join('\t') }; });
  const rel = postPath(filename), imageRoot = imageDirectory(filename);
  const subjectName = filename.slice(11, -3);
  for (const commit of commits) {
    const files = (await runGit(repo, ['-c', 'core.quotePath=false', 'diff-tree', '--no-commit-id', '--name-only', '-r', commit.sha])).split('\n').filter(Boolean);
    const setupFile = file => ['.gitignore', 'AGENTS.md', 'README.md', '打开文章排版工具.command', '_config.yml', '_includes/head.html', '_includes/footer.html', '_layouts/default.html', '_layouts/post.html', 'css/main.css', 'js/main.js', 'sw.js'].includes(file) || file.startsWith('tools/article-studio/') || file.startsWith('.ai/');
    // The first layout update predates the studio: commit naming convention.
    const setup = (commit.subject === 'feat: add local article studio' || commit.subject.startsWith('studio: ') || commit.subject === 'Simplify article studio layout and actions') && files.every(setupFile);
    const target = (commit.subject === `post: ${subjectName}` || commit.subject === `post-unpublish: ${subjectName}`) && files.every(file => file === rel || file.startsWith(imageRoot));
    if (!setup && !target) throw new Error('本地已有其他未推送提交，为避免连带发布，请先处理 Git 同步');
  }
  return commits;
}

function referencedAssets(post) {
  const prefix = `/${imageDirectory(post.filename)}`;
  return [...new Set([...post.body.matchAll(/!\[[^\]]*\]\((\/img\/article-studio\/[^)]+)\)/g)].map(([, ref]) => decodeURIComponent(ref)).filter(ref => ref.startsWith(prefix)).map(ref => ref.slice(1)))];
}

export async function publishManagedPost(filename, expectedRevision, { repo, postsDir = path.join(repo, '_posts'), expectedRemote, preflight }) {
  const post = await readStudioPost(filename, postsDir);
  if (post.revision !== expectedRevision) throw new Error('文章在保存后发生变化，请重新载入并检查');
  const commits = await publishChecks(repo, filename, expectedRemote);
  const online = await remotePosts(repo);
  const remote = online.get(filename);
  const same = remote?.revision === post.revision && await remoteHasAssets(repo, remote);
  if (same) return { message: '文章已同步到 GitHub 仓库。', url: postUrl(filename) };
  const rel = postPath(filename);
  const status = (await runGit(repo, ['status', '--porcelain', '--', rel], { raw: true })).trimEnd();
  if (status && !status.startsWith('?? ') && !status.startsWith(' M ')) throw new Error('这篇文章已有其他 Git 修改，请先检查文件');
  const assets = referencedAssets(post);
  const imageRoot = await fs.realpath(path.join(repo, 'img', 'article-studio')).catch(() => null);
  for (const asset of assets) {
    const full = await fs.realpath(path.join(repo, asset)).catch(() => { throw new Error(`找不到文章配图：${asset}`); });
    if (!imageRoot || !within(imageRoot, full)) throw new Error('文章配图位置不安全');
  }
  const assetStatus = assets.length ? (await runGit(repo, ['status', '--porcelain', '--', ...assets], { raw: true })).trimEnd() : '';
  if (preflight) await preflight();
  if (status || assetStatus) {
    const paths = [rel, ...assets];
    await runGit(repo, ['add', '--', ...paths]);
    await runGit(repo, ['commit', '-m', `post: ${filename.slice(11, -3)}`, '--only', '--', ...paths]);
  } else if (!commits.some(commit => commit.subject === `post: ${filename.slice(11, -3)}`)) throw new Error('本地文章与线上版本不同，但没有待发布的修改，请检查 Git 状态');
  try { await runGit(repo, ['push', 'origin', 'master'], { timeout: 30000 }); }
  catch (error) { throw new Error(`推送未完成：${error.message}。本地提交已保留，可稍后重试。`); }
  return { message: '文章已推送到 GitHub 仓库，网站更新需要一点时间。', url: postUrl(filename) };
}

export async function unpublishManagedPost(filename, expectedRemoteRevision, { repo, expectedRemote }) {
  const commits = await publishChecks(repo, filename, expectedRemote);
  const online = await remotePosts(repo);
  const remote = online.get(filename);
  if (remote && remote.revision !== expectedRemoteRevision) throw new Error('线上文章已发生变化，请刷新清单后再操作');
  const rel = postPath(filename);
  const pending = commits.some(commit => commit.subject === `post-unpublish: ${filename.slice(11, -3)}`);
  if (!remote && !pending) throw new Error('线上仓库中没有这篇文章');
  const localFile = path.join(repo, rel);
  if (!(await fs.lstat(localFile).catch(() => null)) && remote) {
    const content = await runGit(repo, ['show', `origin/master:${rel}`], { raw: true });
    await fs.writeFile(localFile, content, { flag: 'wx' });
  }
  const headHasPost = await runGit(repo, ['cat-file', '-e', `HEAD:${rel}`]).then(() => true, () => false);
  if (headHasPost) {
    if (await runGit(repo, ['-c', 'core.quotePath=false', 'diff', '--cached', '--name-only'])) throw new Error('Git 暂存区已有其他修改，请先处理后再撤下文章');
    await runGit(repo, ['rm', '--cached', '-f', '--', rel]);
    if (await runGit(repo, ['-c', 'core.quotePath=false', 'diff', '--cached', '--name-only']) !== rel) throw new Error('暂存区包含其他修改，已停止撤下');
    await runGit(repo, ['commit', '-m', `post-unpublish: ${filename.slice(11, -3)}`]);
  } else if (!pending) throw new Error('文章已从本地 Git 删除，但找不到可重试的撤下提交');
  try { await runGit(repo, ['push', 'origin', 'master'], { timeout: 30000 }); }
  catch (error) { throw new Error(`撤下推送未完成：${error.message}。本地提交已保留，可稍后重试。`); }
  return { message: '已从 GitHub 博客仓库撤下文章；网站更新需要一点时间。本地稿和配图仍保留。' };
}
