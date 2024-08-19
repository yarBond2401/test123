self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title;
  const body = data.body;
  const icon = data.icon;
  const url = data.data.url;

  const notificationOptions = {
    body: body,
		tag: `notification-${Date.now()}`,
    icon: icon,
    data: {
      url: url,
    },
  };

  self.registration.showNotification(title, notificationOptions);
});