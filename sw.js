// Airport Maps service worker: keeps the app and map tiles you've viewed available offline.
// Airport data itself is stored by the page in IndexedDB, so data/*.json always goes to the network.
const SHELL = "am-shell-v12";
const TILES = "am-tiles-v1";
const MAX_TILES = 3000;
const LEAFLET = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";
const SHELL_FILES = ["./", "./index.html", "./core.js", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png",
  LEAFLET + "leaflet.min.css", LEAFLET + "leaflet.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== TILES).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function trimTiles() {
  const c = await caches.open(TILES);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - MAX_TILES; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;                 // Overpass uses POST → network
  const url = new URL(req.url);

  if (url.hostname === "tile.openstreetmap.org") {   // tiles: cache-first
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) { c.put(req, res.clone()); if (Math.random() < 0.05) trimTiles(); }
        return res;
      } catch { return new Response("", { status: 504 }); }
    }));
    return;
  }

  if (url.origin === location.origin) {
    if (url.pathname.includes("/data/")) return;     // airport data → network (page caches it)
    // app files: network-first so updates arrive, cached copy when offline
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req.mode === "navigate" ? "./index.html" : req, copy)); }
      return res;
    }).catch(() => caches.match(req.mode === "navigate" ? "./index.html" : req, { ignoreSearch: true })));
    return;
  }

  if (url.href.startsWith(LEAFLET)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
