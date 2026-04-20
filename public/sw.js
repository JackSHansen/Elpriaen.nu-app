const STATIC_CACHE = "elpriser-static-v1";
const OFFLINE_PAGE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(["/", OFFLINE_PAGE, "/manifest.json", "/icons/apple-icon.png"]);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isApiRequest = requestUrl.hostname.includes("elprisenligenu.dk");

  if (isApiRequest) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify([]), {
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match(OFFLINE_PAGE));
    }),
  );
});
