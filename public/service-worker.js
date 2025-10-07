// This is the service worker that will handle push notifications.

// Listen for push events
self.addEventListener('push', function (event) {
  if (!event.data) {
    console.error('Push event but no data');
    return;
  }
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/icons/icon-192x192.png',
      badge: '/images/icons/icon-96x96.png',
      data: {
        url: data.url || '/',
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (e) {
    console.error('Error parsing push data', e);
  }
});

// Listen for notification click events
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data.url || '/';

  // This looks for an existing window/tab with the same URL and focuses it.
  // If not found, it opens a new window/tab.
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if there's already a window open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// A simple event listener to ensure the service worker takes control immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
