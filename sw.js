/* ===========================================================
 * sw.js
 * 页面、索引、样式与脚本：网络优先（日更站点，回访要看到当天的首页）
 * 图片与字体：先给缓存，后台再更新
 * 离线：退回缓存，再退回 offline.html
 * ========================================================== */

const VERSION = 'v5';
const PRECACHE = 'precache-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;
const RUNTIME_MAX = 150;
const NETWORK_TIMEOUT = 4000;

// F 卷起新增图谱改用站内共享运行时，预缓存下列资源即可离线打开任意新图与跟练层
const PRECACHE_URLS = [
  'offline.html',
  'css/paper.css',
  'css/syntax.css',
  'js/paper.js',
  'css/xiuxing-3d.css',
  'js/xiuxing-runtime.js',
  'js/xiuxing-atlas.js',
  'js/xiuxing-practice-data.js',
  'js/xiuxing-practice.js'
];

const isNavigation = (req) =>
  req.mode === 'navigate' ||
  (req.method === 'GET' && (req.headers.get('accept') || '').includes('text/html'));

const hasExtension = (url) => /\.\w+$/.test(url.pathname);

// GitHub Pages 对 /about 这类不带斜杠的目录地址会 404，补一个斜杠再跳
const needsSlash = (req, url) =>
  isNavigation(req) && !url.pathname.endsWith('/') && !hasExtension(url);

const isStaticMedia = (url) =>
  /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf)$/i.test(url.pathname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => keep.indexOf(n) === -1).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

const trim = (cache) =>
  cache.keys().then((keys) => {
    const extra = keys.length - RUNTIME_MAX;
    if (extra <= 0) return;
    return Promise.all(keys.slice(0, extra).map((k) => cache.delete(k)));
  });

const store = (req, resp) => {
  if (!resp || !resp.ok || resp.type !== 'basic') return Promise.resolve();
  const copy = resp.clone();
  return caches.open(RUNTIME).then((cache) =>
    cache.delete(req).then(() => cache.put(req, copy)).then(() => trim(cache))
  );
};

// waitUntil 必须在事件分发期间同步调用，所以写缓存的 promise 一开始就挂上
const fetchAndStore = (event, init) => {
  const req = event.request;
  let saved = Promise.resolve();
  const network = fetch(req, init).then((resp) => {
    saved = store(req, resp);
    return resp;
  });
  event.waitUntil(network.then(() => saved).catch(() => {}));
  return network;
};

const networkFirst = (event) => {
  const req = event.request;
  // 导航请求带 init 会被部分浏览器拒绝构造，只对子资源强制回源校验
  const network = fetchAndStore(event, isNavigation(req) ? undefined : { cache: 'no-cache' });

  // 网络慢到超时就先给缓存；没有缓存则继续等网络
  const timeout = new Promise((resolve) => {
    setTimeout(() => caches.match(req).then(resolve), NETWORK_TIMEOUT);
  });

  return Promise.race([network.catch(() => null), timeout])
    .then((resp) => resp || network)
    .catch(() => caches.match(req))
    .then((resp) => resp || (isNavigation(req) ? caches.match('offline.html') : resp));
};

const staleWhileRevalidate = (event) => {
  const network = fetchAndStore(event);
  return caches.match(event.request).then((cached) => cached || network);
};

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (needsSlash(req, url)) {
    url.pathname += '/';
    event.respondWith(Response.redirect(url.href));
    return;
  }

  event.respondWith(isStaticMedia(url) ? staleWhileRevalidate(event) : networkFirst(event));
});
