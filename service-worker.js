const CACHE="ibraq-store-v1";
const FILES=["./","./index.html","./style.css","./store.js","./app.js","./ibraq-logo.jpg","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./manifest.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
