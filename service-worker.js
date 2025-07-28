const CACHE_NAME = "bixmax-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// ✅ PWA Install + Offline Support
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// ✅ Welcome Notification (triggered from main app)
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'show-welcome') {
    self.registration.showNotification("👋 Welcome to BixMAX!", {
      body: "Thanks for visiting us. Enjoy your shopping!",
      icon: "https://bixmax.store/logo.png"
    });
  }
});

// ✅ Notification Click (open homepage)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://bixmax.store')
  );
});

// ✅ Push Notification Handler
self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || "Hello from BixMAX!", {
    body: data.body || "Thanks for visiting us!",
    icon: "https://bixmax.store/logo.png"
  });
});