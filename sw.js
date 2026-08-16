// Lift service worker — offline shell.
// Shell: stale-while-revalidate (instant load, picks up new deploys on next visit).
// Data (api.github.com) is cross-origin and never touched here: always network.
const CACHE = 'lift-shell-v2';
const ASSETS = ['./', 'index.html', 'manifest.json', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      // cache:'no-cache' forces revalidation with the server instead of the
      // browser HTTP cache, so deploys actually reach the SW cache.
      const update = fetch(e.request, { cache: 'no-cache' }).then(res => {
        if (res.ok) {
          const copy = res.clone();
          return caches.open(CACHE).then(c => c.put(e.request, copy)).then(() => res);
        }
        return res;
      });
      // Keep the SW alive until the background refresh finishes — without
      // this the browser kills it and the cache never updates.
      e.waitUntil(update.catch(() => {}));
      return cached || update.catch(() => cached);
    })
  );
});
