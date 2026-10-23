// Service worker de Skooly. Hace dos cosas:
//  1) Existe para que el navegador reconozca la app como instalable. NO guarda nada en caché ni
//     cambia cómo carga la página: cada visita sigue pidiendo todo a la red, así que siempre se
//     ve la versión más reciente.
//  2) Muestra las notificaciones push (pantalla de bloqueo) y abre la app al tocarlas.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Sin respondWith: el navegador resuelve la petición con normalidad.
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // Mensaje sin formato: se muestra el aviso genérico.
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Skooly", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      tag: data.tag || undefined,
      data: { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/dashboard", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const w of windows) {
        if (new URL(w.url).origin === self.location.origin && "focus" in w) {
          return w.focus().then((c) => ("navigate" in c ? c.navigate(url) : c));
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
