/* global self, clients */

self.addEventListener("push", function (event) {
  let payload = { title: "Elctro", body: "", url: "/" };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    /* ignore */
  }
  const url = typeof payload.url === "string" && payload.url.length > 0 ? payload.url : "/";
  event.waitUntil(
    self.registration.showNotification(payload.title || "Elctro", {
      body: payload.body || "",
      data: { url },
      icon: "/favicon.ico",
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ("focus" in client && client.url === url) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
