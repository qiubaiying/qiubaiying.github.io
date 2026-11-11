const PRECACHE = 'precache-v13-toc';
const RUNTIME = 'runtime';
const HOSTNAME_WHITELIST = [self.location.hostname];

const isNavigationReq = (req) =>
  req.mode === 'navigate' ||
  (req.method === 'GET' && req.headers.get('accept').includes('text/html'));

const endWithExtension = (req) =>
  Boolean(new URL(req.url).pathname.match(/\.\w+$/));

const shouldRedirect = (req) =>
  isNavigationReq(req) &&
  new URL(req.url).pathname.substr(-1) !== '/' &&
  !endWithExtension(req);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      cache.addAll(['/offline.html', '/css/main.css?v=20261024-toc', '/js/main.js?v=20261024-toc'])
    ).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) === -1) return;

  if (shouldRedirect(event.request)) {
    const url = new URL(event.request.url);
    url.pathname += '/';
    event.respondWith(Response.redirect(url.href));
    return;
  }

  // 网络优先：先展示最新内容，断网时回退到缓存或离线页
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((hit) => hit || caches.match('offline.html'))
      )
  );
});
