const CACHE_NAME = 'rent-score-v20260610';
const ASSETS = [
  './',
  './index.html',
  './icon-192.svg',
  './icon-512.svg',
  './manifest.json'
];

// 安装：缓存核心资源，立即激活
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存，立即接管所有客户端
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 请求策略：网络优先，缓存回退（确保总是获取最新版本）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // 缓存成功的响应
      if (response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      // 网络失败时使用缓存
      return caches.match(event.request).then(cached => {
        return cached || caches.match('./index.html');
      });
    })
  );
});
