import { marked } from './vendor/marked.esm.js';
import { formatSelection } from './editor-actions.js';
import { wechatTextAlign } from './wechat-style.js';
import { extractBlogSource, sourceFromMeta } from './blog-source.js';
import { imageLabel, normalizeObsidian } from './image-sizing.js';

const $ = id => document.getElementById(id);
const themes = [
  ['sage', '山与生活', '清爽留白', '#edf4ed', '#5a795e'],
  ['classic', '经典雅致', '宋体沉稳', '#f7f0e5', '#896a3d'],
  ['modern', '现代简约', '简洁清晰', '#eaf3f7', '#2d5e72'],
  ['literary', '书卷墨香', '文艺典雅', '#f5edf4', '#735c78'],
  ['warm', '温暖阅读', '暖色护眼', '#fbefdf', '#b27641'],
  ['minimal', '极简留白', '专注阅读', '#f1f3f1', '#414a43']
];
const state = { theme: 'sage', assets: new Map(), qr: null, existingQrUrl: '', saved: null, editing: null, dirty: false, localAssets: new Map(), objectUrls: new WeakMap(), imageRequest: 0, importedFilename: '', importedFrontmatter: '', importedHeading: false, sourceFilenameEdited: false };
let associationTimer;
let foldersReady;
const example = `有时候我会想，生活的意义是什么？\n\n可能不是轰轰烈烈的成就，而是那些细碎但真实的瞬间：一杯好喝的咖啡、一本翻到一半的书、傍晚吹来的风，以及忙碌之余还能保有的那一点热爱。\n\n## 热爱的力量\n\n热爱不是遥不可及的梦想，而是让平凡的日子也闪闪发光的小小火种。它可能很微小，但足以支撑我们走过许多睡前的时刻。\n\n> 生活或许不会一直温柔，但热爱可以让我们在风雨中，依然看见光。\n\n## 在日常中发现惊喜\n\n1. 保持好奇，尝试新事物\n2. 认真对待每一次小小的体验\n3. 记录生活中的美好瞬间\n4. 与喜欢的人分享\n\n愿我们都能在平凡的日子里，保持一点热爱，并在热爱中，成为更好的自己。`;
function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function toast(message, error = false) { const el = $('toast'); el.textContent = message; el.classList.toggle('error', error); el.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => el.hidden = true, 4500); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function safeUrl(value, image = false) {
  try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) || (image && url.protocol === 'blob:') ? value : ''; } catch { return ''; }
}
function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const allowed = new Set('P BR H1 H2 H3 H4 H5 H6 STRONG EM B I U S DEL BLOCKQUOTE UL OL LI A IMG PRE CODE HR TABLE THEAD TBODY TR TH TD'.split(' '));
  const walk = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) child.remove();
      else if (child.nodeType === Node.ELEMENT_NODE) {
        if (['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','FORM'].includes(child.tagName)) { child.remove(); continue; }
        if (!allowed.has(child.tagName)) { walk(child); child.replaceWith(...child.childNodes); continue; }
        const href = child.tagName === 'A' ? safeUrl(child.getAttribute('href') || '') : '';
        const src = child.tagName === 'IMG' ? safeUrl(child.getAttribute('src') || '', true) : '';
        const alt = child.tagName === 'IMG' ? child.getAttribute('alt') || '' : '';
        for (const attr of [...child.attributes]) child.removeAttribute(attr.name);
        if (href) { child.setAttribute('href', href); child.setAttribute('target', '_blank'); child.setAttribute('rel', 'noopener noreferrer'); }
        if (src) { child.setAttribute('src', src); child.setAttribute('alt', alt); }
        else if (child.tagName === 'IMG') { child.replaceWith(doc.createTextNode(`[图片：${alt}]`)); continue; }
        walk(child);
      }
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
function applyImageSizes(container) {
  for (const img of container.querySelectorAll('img')) {
    const label = imageLabel(img.getAttribute('alt') || '');
    if (label.width) {
      img.alt = label.alt;
      img.setAttribute('width', String(label.width));
      if (label.height) img.setAttribute('height', String(label.height));
    }
    const next = img.nextSibling;
    const match = next?.nodeType === Node.TEXT_NODE && next.textContent.match(/^\{: width="(\d{1,4})"(?: height="(\d{1,4})")? \}/);
    if (match && Number(match[1]) > 0 && Number(match[1]) <= 3000 && (!match[2] || Number(match[2]) <= 3000)) {
      img.setAttribute('width', match[1]);
      if (match[2]) img.setAttribute('height', match[2]);
      next.textContent = next.textContent.slice(match[0].length);
    }
  }
}
function renderThemes() {
  $('themes').innerHTML = themes.map(([id,name,description,bg,color]) => `<button class="theme-choice ${id === state.theme ? 'selected' : ''}" type="button" role="radio" aria-checked="${id === state.theme}" data-theme="${id}"><span class="theme-swatch" style="background:${bg};color:${color}">文</span><span class="theme-copy"><strong>${name}</strong><small>${description}</small></span><span class="check">✓</span></button>`).join('');
  $('themes').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    state.theme = button.dataset.theme;
    $('themes').querySelectorAll('button').forEach(choice => {
      const selected = choice === button;
      choice.classList.toggle('selected', selected);
      choice.setAttribute('aria-checked', String(selected));
    });
    render(); markDirty();
  }));
}
function footerHtml() {
  const account = $('wechat-name').value.trim().replace(/^公众号\s*[：:]?\s*/, '');
  const qr = state.qr ? `<img src="${fileUrl(state.qr)}" alt="公众号二维码">` : state.existingQrUrl ? `<img src="${escapeHtml(state.existingQrUrl)}" alt="公众号二维码">` : '';
  return `<strong>关于我</strong><p>旅行、跑步、看书，也喜欢 AI 和数码</p><p>🌍 30+ 国家<br>🏅 半马 1h36 ｜ 全马 3h58</p><p><a href="https://scond.me">主页 scond.me</a></p>${account ? `<p>欢迎关注公众号：${escapeHtml(account)}</p>` : ''}${qr}`;
}
function render() {
  const title = $('title').value.trim() || '文章标题';
  const md = normalizeObsidian($('markdown').value);
  $('preview-heading').textContent = title;
  $('paper').style.setProperty('--article-font-size', `${$('font-size').value}px`);
  $('paper').className = `paper theme-${state.theme}${$('paper').classList.contains('mobile') ? ' mobile' : ''}`;
  $('preview-body').innerHTML = sanitize(marked.parse(md, { breaks: false, gfm: true }));
  applyImageSizes($('preview-body'));
  $('preview-body').querySelectorAll('img').forEach(img => {
    const key = decodeRef(img.getAttribute('src') || '').replace(/^\.\//, '');
    const file = state.assets.get(key) || state.assets.get(key.split('/').pop());
    if (file) img.src = fileUrl(file);
    else if (state.localAssets.has(key)) img.src = state.localAssets.get(key).url;
  });
  $('preview-footer').hidden = !$('footer').checked;
  $('footer-options').hidden = !$('footer').checked;
  if ($('footer').checked) $('preview-footer').innerHTML = footerHtml();
  $('word-count').textContent = `${md.replace(/\s/g,'').length} 字`;
  const linkedCount = localRefs().filter(ref => state.assets.has(ref) || state.assets.has(ref.split('/').pop()) || state.localAssets.has(ref)).length;
  $('asset-count').textContent = linkedCount ? `${linkedCount} 张已关联图片` : '未添加图片';
  renderImageCopies();
}
function localPreviewImages() {
  const images = [...$('preview-body').querySelectorAll('img'), ...($('footer').checked ? $('preview-footer').querySelectorAll('img') : [])];
  return images.filter(img => img.src.startsWith('blob:') || img.src.startsWith(`${location.origin}/api/local-image`) || img.src.startsWith(`${location.origin}/img/`));
}
function renderImageCopies() {
  const images = localPreviewImages();
  $('wechat-images').hidden = !images.length;
  $('wechat-image-list').replaceChildren(...images.map((img, index) => {
    const row = document.createElement('div');
    row.className = 'wechat-image-row';
    const thumb = document.createElement('img');
    thumb.src = img.src; thumb.alt = '';
    const label = document.createElement('span');
    label.textContent = `配图 ${index + 1} · ${img.alt || '未命名图片'}`;
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = '复制图片';
    button.addEventListener('click', () => copySingleImage(index));
    row.append(thumb, label, button);
    return row;
  }));
}
function markDirty() { if (state.saved) { state.saved = null; $('publish').disabled = true; $('status').textContent = '内容已修改，请重新保存'; } }
function leaveEdit() {
  state.editing = null;
  state.existingQrUrl = '';
  $('editing-bar').hidden = true;
  $('date').disabled = false;
  $('save').textContent = '保存到博客仓库';
  state.saved = null;
  $('publish').disabled = true;
}
function parseFrontmatter(text, filename) {
  leaveEdit();
  let body = text.replace(/^\uFEFF/, '');
  let meta = {};
  const match = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  state.importedFilename = filename;
  state.importedFrontmatter = match?.[0] || '';
  if (match) {
    body = body.slice(match[0].length);
    for (const line of match[1].split(/\r?\n/)) {
      const found = line.match(/^([\w-]+):\s*(.*)$/);
      if (found) meta[found[1]] = found[2].replace(/^['"]|['"]$/g, '');
    }
  }
  const heading = body.match(/^#\s+(.+)\r?\n/);
  state.importedHeading = Boolean(heading);
  $('title').value = meta.title || (heading ? heading[1] : filename.replace(/\.md$/i, ''));
  if (heading) body = body.slice(heading[0].length);
  const extracted = extractBlogSource(body.trim());
  const source = sourceFromMeta(meta) || extracted.source;
  $('markdown').value = extracted.body.trim();
  $('source-account').value = source?.account || 'Scond';
  $('source-published').value = source?.publishedAt || '';
  $('source-url').value = source?.url || '';
  $('blog-source').open = Boolean(source);
  if (['14','16','18','20','22'].includes(meta.article_font_size)) $('font-size').value = meta.article_font_size;
  if (meta.date && /^\d{4}-\d{2}-\d{2}$/.test(meta.date)) $('date').value = meta.date;
  $('source-filename').value = suggestedSourceFilename(filename.replace(/\.(?:md|markdown)$/i, ''));
  state.sourceFilenameEdited = false;
  locateImportedFolder(filename);
  markDirty(); render();
}
function suggestedSourceFilename(base) {
  return `${String(base || $('title').value || '新文章').trim().replace(/[\\/:*?"<>|]/g, '-').slice(0, 90)}-排版版.md`;
}
async function getApi(route) {
  const response = await fetch(`/api/${route}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || '读取失败');
  return result;
}
async function loadSourceFolders() {
  const result = await getApi('source-folders');
  $('source-folder').replaceChildren(...result.folders.map(folder => {
    const option = document.createElement('option');
    option.value = folder;
    option.textContent = folder === '.' ? 'Blog 根目录' : `Blog/${folder}`;
    return option;
  }));
  return result;
}
async function locateImportedFolder(filename) {
  try {
    if (!await foldersReady) return;
    const result = await getApi(`source-location?filename=${encodeURIComponent(filename)}`);
    if (filename !== state.importedFilename) return;
    $('source-folder').value = result.folder;
    $('source-location-note').textContent = result.matches.length === 1 ? `已找到原稿文件夹：${result.folder === '.' ? 'Blog 根目录' : `Blog/${result.folder}`}。将创建新文件，不覆盖原稿。` : result.matches.length > 1 ? '找到多个同名原稿，请手动选择保存文件夹；新文件不会覆盖原稿。' : '未找到同名原稿，默认保存到 Blog 根目录；可改选文件夹。';
  } catch (error) { $('source-location-note').textContent = `无法自动定位原稿：${error.message}`; }
}
function sourceMarkdown() {
  const title = $('title').value.trim();
  const body = $('markdown').value.trim();
  if (!title || !body) throw new Error('请先填写标题和正文');
  let frontmatter = state.importedFrontmatter;
  if (frontmatter && /^title:\s*.*$/m.test(frontmatter)) frontmatter = frontmatter.replace(/^title:\s*.*$/m, `title: ${JSON.stringify(title)}`);
  const heading = state.importedHeading || !frontmatter || !/^title:\s*.*$/m.test(frontmatter) ? `# ${title}\n\n` : '';
  return `${frontmatter}${heading}${body}\n`;
}
async function filesToPayload() {
  const entries = localRefs().map(ref => [ref, state.assets.get(ref) || state.assets.get(ref.split('/').pop())]).filter(([,file]) => file);
  if (state.qr && $('footer').checked) entries.push([state.qr.name, state.qr]);
  return Promise.all(entries.map(async ([name,file]) => ({ name, type: file.type, data: (await toDataUrl(file)).split(',')[1] })));
}
function toDataUrl(file) { return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); }); }
async function api(route, data) {
  const response = await fetch(`/api/${route}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || '操作失败');
  return result;
}
async function save() {
  if (!$('title').value.trim() || !$('markdown').value.trim()) return toast('请先填写标题和正文', true);
  $('save').disabled = true;
  try {
    await resolveLocalImages();
    const result = await api('save', { title: $('title').value, markdown: normalizeObsidian($('markdown').value), date: $('date').value, tags: $('tags').value.split(/[,，]/).map(s=>s.trim()).filter(Boolean), style: state.theme, fontSize: Number($('font-size').value), sourceAccount: $('source-account').value, sourcePublishedAt: $('source-published').value, sourceUrl: $('source-url').value, localImages: [...state.localAssets.values()].filter(asset => !state.assets.has(asset.ref) && !state.assets.has(asset.ref.split('/').pop())).map(({ref,id}) => ({ref,id})), footer: $('footer').checked, wechatName: $('wechat-name').value, qrImageName: state.qr?.name, assets: await filesToPayload(), editingFilename: state.editing?.filename, expectedRevision: state.editing?.revision });
    if (state.editing) {
      state.editing.revision = result.revision;
      $('markdown').value = result.markdown;
      state.assets.clear(); state.localAssets.clear(); state.qr = null; $('qr').value = '';
      state.existingQrUrl = result.qrPath || '';
      render();
    }
    state.saved = result; $('publish').disabled = false;
    $('status').textContent = `已${state.editing ? '更新' : '保存'}：${result.filename}`;
    toast(state.editing ? '原文章已更新到本地博客仓库' : '文章已保存到本地博客仓库');
    $('saved-posts').open = true;
    refreshSavedPosts();
  } catch (e) { toast(e.message, true); } finally { $('save').disabled = false; }
}
async function saveSource() {
  $('save-md').disabled = true;
  try {
    if (!await foldersReady) throw new Error('请先检查 Obsidian Blog 文件夹');
    await resolveLocalImages();
    const result = await api('save-source', { folder: $('source-folder').value, filename: $('source-filename').value || suggestedSourceFilename(state.importedFilename.replace(/\.(?:md|markdown)$/i, '')), markdown: sourceMarkdown(), assets: await filesToPayload() });
    $('source-save').open = true;
    $('source-location-note').textContent = `已另存：${result.path}。原稿未被覆盖。`;
    toast(`已另存为 ${result.filename}${result.images ? `，新增 ${result.images} 张图片` : ''}`);
  } catch (error) { toast(`另存失败：${error.message}`, true); }
  finally { $('save-md').disabled = false; }
}
async function refreshSavedPosts(checkRemote = false) {
  try {
    if (checkRemote) $('saved-posts-note').textContent = '正在检查 GitHub 仓库状态…';
    const { posts, remoteError } = await getApi(`studio-posts?refresh=${checkRemote ? '1' : '0'}`);
    $('saved-posts-note').textContent = remoteError ? `线上状态未核实：${remoteError}` : '状态以 GitHub 仓库为准；网站页面更新可能稍晚。';
    $('saved-count').textContent = `(${posts.length})`;
    $('saved-post-list').replaceChildren(...posts.map(post => {
      const row = document.createElement('div'); row.className = 'saved-post-row'; row.setAttribute('role', 'listitem');
      const name = document.createElement('span'); name.textContent = post.title;
      const date = document.createElement('small'); date.textContent = post.date;
      const badge = document.createElement('em'); badge.className = `post-status status-${post.status}`;
      badge.textContent = ({ local: '仅本地', synced: '已同步 GitHub', needs_sync: '有待发布修改', remote_only: '线上仍在，本地已删', unverified: '线上状态未核实' })[post.status] || '状态未知';
      name.append(date, badge);
      const actions = document.createElement('div'); actions.className = 'saved-post-actions';
      const choices = post.localExists ? [['博客预览', () => showSavedPreview(post)]] : [];
      if (post.localExists) choices.push(['编辑', () => editSavedPost(post.filename)]);
      else choices.push(['恢复本地', () => restoreSavedPost(post)]);
      if (post.localExists && post.status !== 'synced') choices.push([post.remoteExists ? '更新线上' : '发布', () => publishSavedPost(post)]);
      if (post.remoteExists) choices.push(['撤下线上', () => unpublishSavedPost(post)]);
      if (post.remoteExists) choices.push(['打开线上', () => window.open(post.url, '_blank', 'noopener')]);
      if (post.localExists) choices.push(['删本地', () => deleteSavedPost(post)]);
      for (const [label, action] of choices) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        if (label === '撤下线上' || label === '删本地') button.className = 'danger';
        button.addEventListener('click', async () => { button.disabled = true; try { await action(); } finally { button.disabled = false; } });
        actions.append(button);
      }
      row.append(name);
      if (post.localPath) {
        const location = document.createElement('details'); location.className = 'saved-post-location';
        const summary = document.createElement('summary'); summary.textContent = '查看本地文件路径';
        const filePath = document.createElement('code'); filePath.textContent = post.localPath;
        const copyPath = document.createElement('button'); copyPath.type = 'button'; copyPath.textContent = '复制路径';
        copyPath.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(post.localPath); toast('本地文件路径已复制'); }
          catch { toast('复制失败，请选中上方路径手动复制', true); }
        });
        location.append(summary, filePath, copyPath);
        row.append(location);
      }
      row.append(actions);
      return row;
    }));
    if (!posts.length) $('saved-post-list').textContent = '还没有通过本工具保存的博客文章。';
  } catch (error) { $('saved-post-list').textContent = `清单读取失败：${error.message}`; }
}
async function publishSavedPost(post) {
  if (!confirm(`将「${post.title}」提交并推送到 GitHub 博客仓库。若有已检查的本地工具更新，也会一起同步。继续吗？`)) return;
  try {
    const result = await api('publish', { filename: post.filename, revision: post.revision });
    $('status').textContent = `已推送：${post.filename}`;
    toast(result.message);
    await refreshSavedPosts(true);
  } catch (error) { toast(`发布失败：${error.message}`, true); }
}
async function unpublishSavedPost(post) {
  if (!confirm(`确定从线上博客撤下「${post.title}」吗？这会提交并推送删除文章的改动；若有已检查的本地工具更新，也会一起同步。网站更新后将不再显示；本地稿、配图及 Git 历史仍保留。`)) return;
  try {
    const result = await api('unpublish', { filename: post.filename, remoteRevision: post.remoteRevision });
    $('status').textContent = `已从线上撤下：${post.filename}`;
    toast(result.message);
    await refreshSavedPosts(true);
  } catch (error) { toast(`撤下失败：${error.message}`, true); }
}
async function restoreSavedPost(post) {
  try {
    await api('restore-studio-post', { filename: post.filename });
    toast('已从 GitHub 仓库恢复到本地，可继续编辑');
    await refreshSavedPosts(true);
  } catch (error) { toast(`恢复失败：${error.message}`, true); }
}
async function editSavedPost(filename) {
  if (!confirm('载入这篇文章会替换当前编辑区的内容。继续吗？')) return;
  try {
    const post = await getApi(`studio-post?filename=${encodeURIComponent(filename)}`);
    const footerMark = '\n\n---\n\n**关于我**  \n';
    const footerAt = post.body.lastIndexOf(footerMark);
    const footer = footerAt < 0 ? '' : post.body.slice(footerAt + footerMark.length);
    const article = footerAt < 0 ? post.body : post.body.slice(0, footerAt);
    const extracted = extractBlogSource(article.trim());
    const source = post.source || extracted.source;
    state.assets.clear(); state.localAssets.clear(); state.qr = null;
    state.existingQrUrl = footer.match(/!\[公众号二维码\]\((\/img\/article-studio\/[^)]+)\)/)?.[1] || '';
    $('qr').value = '';
    state.importedFilename = ''; state.importedFrontmatter = ''; state.importedHeading = false;
    state.editing = { filename: post.filename, revision: post.revision };
    state.saved = null;
    $('publish').disabled = true;
    $('title').value = post.title;
    $('date').value = post.date;
    $('date').disabled = true;
    $('tags').value = post.tags.join('，');
    $('markdown').value = extracted.body;
    $('source-account').value = source?.account || 'Scond';
    $('source-published').value = source?.publishedAt || '';
    $('source-url').value = source?.url || '';
    $('blog-source').open = Boolean(source);
    $('font-size').value = String(post.fontSize);
    state.theme = post.style;
    $('footer').checked = Boolean(footer);
    $('wechat-name').value = footer.match(/欢迎关注公众号：([^\n]+)/)?.[1] || footer.match(/欢迎关注：(?:公众号)?([^\n]+)/)?.[1] || '';
    $('source-filename').value = suggestedSourceFilename(post.title);
    state.sourceFilenameEdited = false;
    $('editing-label').textContent = `正在编辑：${post.title}。更新会保留原文章文件名和链接。`;
    $('editing-bar').hidden = false;
    $('save').textContent = '更新博客文章';
    $('status').textContent = `正在编辑：${post.filename}`;
    renderThemes(); render(); await resolveLocalImages();
    $('title').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } catch (error) { toast(`载入失败：${error.message}`, true); }
}
async function deleteSavedPost(post) {
  if (!confirm(`确定删除「${post.title}」的本地 Markdown 文件吗？${post.remoteExists ? '线上文章仍会保留在清单，可再点“撤下线上”或“恢复本地”。' : ''}原有配图文件会保留。`)) return;
  try {
    await api('delete-studio-post', { filename: post.filename, expectedRevision: post.revision });
    if (state.editing?.filename === post.filename) leaveEdit();
    if (state.saved?.filename === post.filename) { state.saved = null; $('publish').disabled = true; }
    $('status').textContent = `已从本地仓库删除：${post.filename}`;
    toast(post.remoteExists ? '本地稿已删除；线上文章仍在清单中' : '本地文章已删除');
    await refreshSavedPosts();
  } catch (error) { toast(`删除失败：${error.message}`, true); }
}
async function showSavedPreview(post) {
  const dialog = $('saved-preview');
  const frame = $('saved-blog-frame');
  const loading = $('saved-preview-loading');
  const open = $('saved-preview-open');
  $('saved-preview-title').textContent = post.title;
  $('saved-preview-note').textContent = `${post.date} · 本地已保存版本，不会执行发布`;
  loading.textContent = '正在生成博客页面…';
  loading.hidden = false;
  frame.hidden = true;
  frame.removeAttribute('src');
  open.hidden = true;
  open.removeAttribute('href');
  dialog.showModal();
  try {
    const result = await getApi(`blog-preview?filename=${encodeURIComponent(post.filename)}`);
    if (!dialog.open) return;
    frame.onload = () => { loading.hidden = true; frame.hidden = false; };
    frame.src = result.url;
    open.href = result.url;
    open.hidden = false;
  } catch (error) {
    loading.textContent = `预览失败：${error.message}`;
    $('saved-preview-note').textContent = '本地博客构建未完成';
  }
}
async function publish() {
  if (!state.saved) return;
  if (!confirm(`即将提交并推送「${$('title').value}」到 GitHub，网站会公开展示这篇文章。若有已检查的本地工具更新，也会一起同步。继续吗？`)) return;
  $('publish').disabled = true;
  try { const result = await api('publish', { filename: state.saved.filename, revision: state.saved.revision }); $('status').textContent = '已推送到线上博客'; toast(result.message); await refreshSavedPosts(true); }
  catch (e) { $('publish').disabled = false; toast(e.message, true); }
}
async function inlineCopyHtml() {
  const missing = localRefs().filter(ref => !state.assets.has(ref) && !state.assets.has(ref.split('/').pop()) && !state.localAssets.has(ref));
  if (missing.length) {
    await resolveLocalImages();
    const unresolved = missing.filter(ref => !state.assets.has(ref) && !state.assets.has(ref.split('/').pop()) && !state.localAssets.has(ref));
    if (unresolved.length) throw new Error(`有 ${unresolved.length} 张图片未关联：${unresolved.slice(0, 2).join('、')}`);
  }
  const clone = $('paper').cloneNode(true);
  clone.removeAttribute('id'); clone.removeAttribute('class');
  const sourceNodes = [$('paper'), ...$('paper').querySelectorAll('*')];
  const targetNodes = [clone, ...clone.querySelectorAll('*')];
  sourceNodes.forEach((source, i) => {
    const target = targetNodes[i]; if (!target) return;
    const computed = getComputedStyle(source);
    if (i === 0) {
      target.setAttribute('style', `color:${computed.color};background-color:${computed.backgroundColor};font-family:${computed.fontFamily};font-size:${computed.fontSize};line-height:${computed.lineHeight};text-align:${wechatTextAlign(computed.textAlign, computed.direction)};width:100%;max-width:100%;margin:0;padding:0;border:0;border-radius:0;box-sizing:border-box`);
      return;
    }
    const props = ['color','background-color','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','margin-top','margin-bottom','padding-top','padding-right','padding-bottom','padding-left','border-left','border-top','border-bottom','border-radius','max-width','display','text-decoration'];
    target.setAttribute('style', props.map(p => `${p}:${p === 'text-align' ? wechatTextAlign(computed.getPropertyValue(p), computed.direction) : computed.getPropertyValue(p)}`).join(';'));
    if (source.tagName === 'H1') { target.style.fontSize = '24px'; target.style.lineHeight = '1.45'; }
    if (source.tagName === 'H2') { target.style.fontSize = `${Math.min(22, Number($('font-size').value) + 3)}px`; target.style.lineHeight = '1.45'; target.style.marginTop = '1.6em'; target.style.marginBottom = '.65em'; }
    if (source.tagName === 'H3') { target.style.fontSize = `${Math.min(19, Number($('font-size').value) + 1)}px`; target.style.lineHeight = '1.45'; target.style.marginTop = '1.5em'; target.style.marginBottom = '.6em'; }
    target.removeAttribute('class'); target.removeAttribute('hidden'); target.removeAttribute('id');
    if (source.tagName === 'IMG' && source.hasAttribute('width')) target.style.width = `${source.getAttribute('width')}px`;
  });
  if (!$('footer').checked) clone.querySelector('.article-footer')?.remove();
  await Promise.all([...clone.querySelectorAll('img')].map(async img => {
    if (!localPreviewImages().some(local => local.src === img.src)) return;
    const response = await fetch(img.src);
    if (!response.ok) throw new Error(`无法读取图片：${img.alt || '未命名图片'}`);
    img.src = await toDataUrl(await response.blob());
    img.style.maxWidth = '100%'; img.style.height = 'auto';
  }));
  return clone.outerHTML;
}
async function copy() {
  if (!$('markdown').value.trim()) return toast('请先输入正文', true);
  $('copy').disabled = true;
  $('copy').textContent = '正在准备图片…';
  const plain = `${$('title').value}\n\n${$('markdown').value}`;
  try {
    const html = inlineCopyHtml().then(value => new Blob([value], {type:'text/html'}));
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': html, 'text/plain': new Blob([plain], {type:'text/plain'}) })]);
    toast(`已复制富文本和 ${localPreviewImages().length} 张本地图片；粘贴后请检查图片是否显示`);
  } catch (e) { toast(`复制失败：${e.message || '请检查剪贴板权限及图片关联'}`, true); }
  finally { $('copy').disabled = false; $('copy').textContent = '复制到公众号'; }
}
async function copySingleImage(index) {
  const img = localPreviewImages()[index];
  if (!img) return toast('这张图片已失效，请重新关联', true);
  try {
    const png = (async () => {
      const response = await fetch(img.src);
      if (!response.ok) throw new Error('读取图片失败');
      const blob = await response.blob();
      if (blob.type === 'image/png') return blob;
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      bitmap.close();
      const converted = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!converted) throw new Error('图片转换失败');
      return converted;
    })();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    toast(`配图 ${index + 1} 已复制，请在公众号对应位置粘贴`);
  } catch (e) { toast(`图片复制失败：${e.message}`, true); }
}
$('date').value = localDate(); $('title').value = '在平凡的日子里，保持一点热爱'; $('markdown').value = example;
renderThemes(); render();
$('source-filename').value = suggestedSourceFilename($('title').value);
foldersReady = loadSourceFolders().catch(error => { $('source-location-note').textContent = `Obsidian 文件夹读取失败：${error.message}`; return null; });
refreshSavedPosts(true);
for (const id of ['title','date','tags','wechat-name','font-size']) $(id).addEventListener('input', () => { markDirty(); render(); });
$('title').addEventListener('input', () => { if (!state.importedFilename && !state.sourceFilenameEdited) $('source-filename').value = suggestedSourceFilename($('title').value); });
$('source-filename').addEventListener('input', () => { state.sourceFilenameEdited = true; });
for (const id of ['source-account','source-published','source-url']) $(id).addEventListener('input', markDirty);
$('markdown').addEventListener('input', () => {
  const extracted = extractBlogSource($('markdown').value);
  if (extracted.source) {
    $('markdown').value = extracted.body;
    $('source-account').value = extracted.source.account;
    $('source-published').value = extracted.source.publishedAt;
    $('source-url').value = extracted.source.url;
    $('blog-source').open = true;
    toast('已把公众号来源信息移到「仅博客显示」');
  }
  markDirty(); render();
});
$('footer').addEventListener('change', () => { markDirty(); render(); });
$('import-md').addEventListener('click', () => $('md-file').click());
$('md-file').addEventListener('change', async e => { const file = e.target.files[0]; if (file) { state.assets.clear(); state.localAssets.clear(); parseFrontmatter(await file.text(), file.name); await resolveLocalImages(); toast(`已导入 ${file.name}`); } });
$('assets').addEventListener('change', e => { for (const file of e.target.files) state.assets.set(file.name, file); markDirty(); render(); resolveLocalImages(); });
$('qr').addEventListener('change', e => { state.qr = e.target.files[0] || null; markDirty(); render(); });
$('save').addEventListener('click', save); $('save-md').addEventListener('click', saveSource); $('publish').addEventListener('click', publish); $('copy').addEventListener('click', copy);
$('more-actions').addEventListener('click', event => { if (event.target.closest('.action-menu-panel button')) $('more-actions').open = false; });
document.addEventListener('click', event => { if (!event.target.closest('#more-actions')) $('more-actions').open = false; });
document.addEventListener('keydown', event => { if (event.key === 'Escape') $('more-actions').open = false; });
$('cancel-edit').addEventListener('click', () => { leaveEdit(); $('status').textContent = '已退出编辑；当前内容可另存为新文章'; render(); });
$('refresh-posts').addEventListener('click', () => refreshSavedPosts(true));
$('saved-posts').addEventListener('toggle', () => { if ($('saved-posts').open) refreshSavedPosts(); });
$('close-saved-preview').addEventListener('click', () => $('saved-preview').close());
$('desktop-view').addEventListener('click', () => { $('paper').classList.remove('mobile'); $('desktop-view').classList.add('active'); $('mobile-view').classList.remove('active'); });
$('mobile-view').addEventListener('click', () => { $('paper').classList.add('mobile'); $('mobile-view').classList.add('active'); $('desktop-view').classList.remove('active'); });

function decodeRef(value) { try { return decodeURIComponent(value); } catch { return value; } }
function fileUrl(file) { if (!state.objectUrls.has(file)) state.objectUrls.set(file, URL.createObjectURL(file)); return state.objectUrls.get(file); }
function localRefs() {
  const refs = [];
  marked.walkTokens(marked.lexer(normalizeObsidian($('markdown').value)), token => {
    if (token.type === 'image' && !/^(https?:|data:|blob:|\/img\/)/i.test(token.href)) refs.push(decodeRef(token.href).replace(/^\.\//, ''));
  });
  return [...new Set(refs)];
}
async function resolveLocalImages() {
  clearTimeout(associationTimer);
  const request = ++state.imageRequest;
  const refs = localRefs();
  if (!refs.length) { state.localAssets.clear(); $('image-status').textContent = '没有待关联图片'; render(); return; }
  if (refs.every(ref => state.assets.has(ref) || state.assets.has(ref.split('/').pop()))) {
    state.localAssets.clear(); $('image-status').textContent = `已关联 ${refs.length} / ${refs.length} 张`;
    $('image-details').textContent = '已从你选择的图片中完成匹配。'; render(); return;
  }
  $('image-status').textContent = '正在查找图片…';
  try {
    const result = await api('resolve-images', { markdown: $('markdown').value, directory: $('image-directory').value });
    if (request !== state.imageRequest) return;
    state.localAssets = new Map(result.assets.map(asset => [asset.ref.replace(/^\.\//, ''), asset]));
    const missing = result.missing.filter(asset => !state.assets.has(asset.ref) && !state.assets.has(asset.ref.split('/').pop()));
    $('image-status').textContent = `已关联 ${refs.length - missing.length} / ${refs.length} 张`;
    $('image-details').textContent = missing.length ? missing.map(x => `${x.ref}：${x.reason}`).join('；') : '文章引用的图片已全部关联。保存到博客时会一起复制图片。';
    if (missing.length) document.querySelector('.image-settings').open = true;
    render();
  } catch (error) {
    if (request !== state.imageRequest) return;
    state.localAssets.clear();
    $('image-status').textContent = '请检查图片目录';
    $('image-details').textContent = error.message;
    render();
  }
}
function applyFormat(format) {
  const editor = $('markdown');
  const result = formatSelection(editor.value, editor.selectionStart, editor.selectionEnd, format);
  editor.value = result.text;
  editor.focus(); editor.setSelectionRange(result.start, result.end);
  markDirty(); render();
}
document.querySelectorAll('[data-format]').forEach(button => {
  button.addEventListener('mousedown', event => event.preventDefault());
  button.addEventListener('click', () => applyFormat(button.dataset.format));
});
$('markdown').addEventListener('keydown', event => {
  const format = { b: 'bold', i: 'italic', u: 'underline' }[event.key.toLowerCase()];
  if ((event.metaKey || event.ctrlKey) && !event.shiftKey && format) { event.preventDefault(); applyFormat(format); }
});
$('markdown').addEventListener('input', () => { clearTimeout(associationTimer); associationTimer = setTimeout(resolveLocalImages, 600); });
$('resolve-images').addEventListener('click', resolveLocalImages);
$('image-directory').addEventListener('change', () => { markDirty(); resolveLocalImages(); });
$('image-folder').addEventListener('change', event => {
  for (const file of event.target.files) {
    if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) continue;
    const relative = file.webkitRelativePath || file.name;
    state.assets.set(relative, file);
    if (!state.assets.has(file.name)) state.assets.set(file.name, file);
  }
  markDirty(); render(); resolveLocalImages();
});
fetch('/api/config').then(response => response.json()).then(config => { $('image-directory').value = config.imageDirectory; }).catch(() => { $('image-status').textContent = '请重启工具以启用图片关联'; });
