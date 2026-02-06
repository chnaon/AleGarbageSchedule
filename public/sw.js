const CACHE_NAME = "ale-waste-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // For API calls, always try network
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For pages and static assets - network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Handle messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATIONS") {
    scheduleNotifications();
  }
});

// Schedule notification checks
async function scheduleNotifications() {
  // Check every hour if we need to send notifications
  setInterval(checkAndNotify, 60 * 60 * 1000);
  // Also check immediately
  checkAndNotify();
}

async function checkAndNotify() {
  try {
    const now = new Date();
    const hour = now.getHours();

    // Evening reminder at 18:00 for tomorrow's collection
    // Morning reminder at 06:00 for today's collection
    if (hour !== 18 && hour !== 6) return;

    // Check if we already notified (use a simple flag in cache)
    const notifyKey = `notified-${now.toISOString().split("T")[0]}-${hour}`;
    const cache = await caches.open(CACHE_NAME);
    const existing = await cache.match(new Request(`/notify-flag/${notifyKey}`));
    if (existing) return;

    // Get cached schedule data
    const clients = await self.clients.matchAll();
    if (clients.length === 0) return;

    // Fetch the latest schedule from cache
    const cachedSchedule = await cache.match(
      new Request("/api/schedule", { method: "GET" })
    );
    if (!cachedSchedule) return;

    // Mark as notified
    await cache.put(
      new Request(`/notify-flag/${notifyKey}`),
      new Response("1")
    );

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const todayStr = now.toISOString().split("T")[0];

    // We can't easily parse the schedule here without the full app context,
    // so we'll send a generic reminder
    if (hour === 18) {
      self.registration.showNotification("Sophämtning imorgon", {
        body: "Glöm inte att ställa ut soporna!",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: `reminder-${tomorrowStr}`,
        data: { url: "/" },
      });
    } else if (hour === 6) {
      self.registration.showNotification("Sophämtning idag", {
        body: "Soporna hämtas idag!",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: `reminder-${todayStr}`,
        data: { url: "/" },
      });
    }
  } catch (e) {
    // Silently fail
  }
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});
