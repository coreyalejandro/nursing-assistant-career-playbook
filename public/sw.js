/* Nursing Assistant Career Playbook — service worker
 * Strategy:
 *   - Precache a small, stable app shell (offline page, manifest, icons,
 *     static offline content).
 *   - Static hashed assets (/assets/*): stale-while-revalidate.
 *   - Navigations: network-first, fall back to cached page, then /offline.html.
 *   - /api and /live (WebSocket/Gemini): NEVER cached — always network. When
 *     offline, /api returns a friendly JSON error instead of a broken request.
 *
 * NOTE: this is a working offline scaffold. Full offline parity for the live
 * AI features is intentionally out of scope (they require connectivity).
 */
const CACHE = "cna-playbook-v2";
const APP_SHELL = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
  "/offline-content.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GETs.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Never cache the live API / websocket upgrade endpoints.
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/live")) {
    event.respondWith(
      fetch(req).catch(() =>
        new Response(
          JSON.stringify({ success: false, offline: true, error: "You're offline. Live features need a connection." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        )
      )
    );
    return;
  }

  // App navigations: network-first with offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/offline.html")))
    );
    return;
  }

  // Hashed static assets: stale-while-revalidate.
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }
});

/* --- Push notifications (active once Firebase Cloud Messaging is wired) --- */
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  const title = data.title || "Certified Nursing Assistant (CNA) Career Playbook";
  const options = {
    body: data.body || "You have a new update.",
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    data: { url: (data.data && data.data.url) || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.navigate(url); return c.focus(); }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
