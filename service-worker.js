self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'show-welcome') {
    self.registration.showNotification("👋 Welcome to BixMAX!", {
      body: "Thanks for visiting us. Enjoy your shopping!",
      icon: "https://bixmax.store/logo.png"
    });
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://bixmax.store')
  );
});

self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || "Hello from BixMAX!", {
    body: data.body || "Thanks for visiting us!",
    icon: 'https://bixmax.store/logo.png'
  });
});