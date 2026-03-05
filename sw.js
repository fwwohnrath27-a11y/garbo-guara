const CACHE_NAME = 'garbo-guara-v1';
const WOLF_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%90%BA%3C/text%3E%3C/svg%3E";

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add('/'))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'SHOW_NOTIFICATION') return;
  const { title, body, tag, data } = event.data;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: WOLF_ICON,
      badge: WOLF_ICON,
      tag: tag || 'garbo-notif',
      data: data || {},
      vibrate: [200, 100, 200],
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = (event.notification.data || {}).action || '';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const win = list.find(c => 'focus' in c);
      if (win) {
        win.focus();
        win.postMessage({ type: 'NOTIFICATION_CLICK', action });
      } else {
        clients.openWindow('/');
      }
    })
  );
});
