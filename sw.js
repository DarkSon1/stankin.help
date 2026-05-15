const CACHE_NAME = 'stankin-v1';
const urls = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/data/graph.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urls)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
