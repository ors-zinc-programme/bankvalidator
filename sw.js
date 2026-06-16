// Bank Account Validator - offline shell cache
const CACHE = "cbd-validator-v5";
const SHELL = [
  "validator.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {mode:"no-cors"})))).then(()=>self.skipWaiting()).catch(()=>{}));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = e.request.url;
  // Never cache validation calls — always hit the network for fresh resolves.
  if (url.includes("workers.dev") || url.includes("val.run") || url.includes("script.google.com") || url.includes("api.paystack")) return;
  // Cache-first for the app shell, network fallback.
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(()=>hit))
  );
});
