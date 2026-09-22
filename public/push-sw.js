self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: 'Meal App', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Meal App';
  const options = {
    body: data.body || '',
    icon: '/AppIcon-192.png',
    badge: '/notification.svg',
    data: data.data || {},
    vibrate: [100, 50, 100],
  };

  const tasks = [self.registration.showNotification(title, options)];

  if ('setAppBadge' in self.registration) {
    tasks.push(self.registration.setAppBadge(1));
  }

  event.waitUntil(Promise.all(tasks));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL('/activities', self.location.origin).href;

  event.waitUntil(
    Promise.all([
      'clearAppBadge' in self.registration ? self.registration.clearAppBadge() : Promise.resolve(),
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('navigate' in client && 'focus' in client) {
            return client.navigate(urlToOpen).then(() => client.focus());
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
    ])
  );
});
