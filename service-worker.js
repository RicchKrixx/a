const CACHE_NAME = "bixmax-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/Bixmaxlogo.png",
  "/Bixmax.store.logo.png"
];

// Install - Cache essential assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Fetch - Serve from cache or fall back to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Notification click handler
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("https://bixmax.store")
  );
});

// Push notification handler
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || "Hello from BixMAX!", {
    body: data.body || "Thanks for visiting us!",
    icon: "https://bixmax.store/logo.png"
  });
});