const CACHE_VERSION = '1.0.1';

self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title;
  const body = data.body;
  const icon = data.icon;

  const notificationOptions = {
    body: body,
    tag: `notification-${Date.now()}`,
    icon: icon,
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});