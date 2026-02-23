const CACHE_NAME = "offline-guarantee-v1";

const CORE = [
  "/",
  "/index.html",
  "/manifest.json"
];

// 安装阶段：只缓存最核心的入口
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE);
    })
  );
  self.skipWaiting();
});

// 激活阶段：清理旧缓存
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 拦截所有请求
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        // 网络失败 → 强制返回首页
        return caches.match("/index.html");
      })
  );
});
