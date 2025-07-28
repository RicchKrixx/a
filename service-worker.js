self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://bixmax.store') // Open your site when the notification is clicked
  );
});

self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || "Hello from BixMAX!", {
    body: data.body || "Thanks for visiting us!",
    icon: 'https://bixmax.store/logo.png'
  });
});