// THIS IS A NEW FILE
// This is the service worker file for handling push notifications.

self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'Mercado Vecinal';
  
  const options = {
    body: data.body,
    icon: '/images/logo.png', // A generic logo for notifications
    badge: '/images/badge.png', // A smaller badge icon
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // This focuses the client if it's already open
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientsArr => {
      const hadWindowToFocus = clientsArr.some(windowClient =>
        windowClient.url === '/' ? (windowClient.focus(), true) : false
      );
      
      // If no window was focused, open a new one
      if (!hadWindowToFocus) {
        clients.openWindow('/notifications').then(windowClient => windowClient ? windowClient.focus() : null);
      }
    })
  );
});
