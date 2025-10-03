// This file should be in the 'public' directory of your Next.js project.

self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push event data is not valid JSON', e);
      data = { title: 'Notificación', body: event.data.text() };
    }
  }

  const title = data.title || 'Notificación de L-weso';
  const options = {
    body: data.body || 'Has recibido una nueva actualización.',
    icon: '/icon-192x192.png', // You can add an icon for your app here
    badge: '/badge-72x72.png', // And a badge
    data: {
        url: data.url || '/',
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // If a window for this origin is already open, focus it.
      for (const client of clientList) {
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
