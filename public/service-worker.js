// This file is intentionally kept simple for the PoC.
// In a real-world app, you'd want to handle more events and edge cases.

self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'Mercado Vecinal';
  const options = {
    body: data.body || 'Tienes una nueva notificación.',
    icon: '/images/icons/icon-192x192.png', // Path to your icon
    badge: '/images/icons/icon-72x72.png', // Path to a badge icon
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then(function (clientList) {
      // If the site is already open, focus it.
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
