const CACHE_NAME = 'archinspire-v2';

// 必须保证这些文件真实存在
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/a.png'
];

// 安装阶段：缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// 激活阶段：删除旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 请求拦截
self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 1️⃣ 先尝试缓存（让App离线可用）
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      // 有缓存直接返回
      if (cachedResponse) {
        return cachedResponse;
      }

      // 没缓存再走网络
      return fetch(event.request)
        .then(networkResponse => {

          // 更新缓存
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });

        })
        .catch(() => {

          // 网络彻底失败 → 返回首页
          return caches.match('/index.html');

        });

    })
  );
});
