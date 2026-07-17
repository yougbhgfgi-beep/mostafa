const CACHE_NAME = 'love-story-cache-v20'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((resp) => {
      if (resp.status === 200 && event.request.method === 'GET') {
        const clone = resp.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
      }
      return resp
    }).catch(() => caches.match(event.request))
  )
})
