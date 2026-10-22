// Service worker mínimo de Skooly. Existe solo para que el navegador reconozca la app como
// instalable. NO guarda nada en caché ni cambia cómo carga la página: cada visita sigue
// pidiendo todo a la red, así que siempre se ve la versión más reciente.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // Sin respondWith: el navegador resuelve la petición con normalidad.
});
