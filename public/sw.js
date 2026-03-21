self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] ========== PUSH EVENT RECEIVED ==========');
  console.log('[SW] Event:', event);
  console.log('[SW] Has data:', !!event.data);

  let data = {
    title: 'Subscription Reminder',
    body: 'You have an upcoming renewal',
  };

  if (event.data) {
    try {
      const text = event.data.text();
      console.log('[SW] Raw push data:', text);
      console.log('[SW] Data length:', text.length);

      // Try to parse as JSON first
      try {
        data = JSON.parse(text);
        console.log('[SW] ✅ Parsed JSON:', data);
      } catch (parseError) {
        // If not JSON, treat as plain text message
        console.log('[SW] ⚠️ Not JSON, using as plain text');
        data = {
          title: 'Push Notification',
          body: text,
        };
      }
    } catch (e) {
      console.error('[SW] ❌ Failed to read push data:', e);
    }
  } else {
    console.warn('[SW] ⚠️ Empty push (no data)');
  }

  const options = {
    body: data.body,
    icon: data.icon || '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    data: { url: data.url || '/dashboard' },
    tag: data.tag || 'subscription-renewal',
    requireInteraction: false,
  };

  console.log('[SW] 📢 Showing notification...');
  console.log('[SW] Title:', data.title);
  console.log('[SW] Options:', options);

  const showPromise = self.registration.showNotification(data.title, options)
    .then(() => console.log('[SW] ✅ Notification shown!'))
    .catch((err) => console.error('[SW] ❌ Show failed:', err));

  event.waitUntil(showPromise);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
