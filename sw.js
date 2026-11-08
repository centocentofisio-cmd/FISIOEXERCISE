/* FISIOEXERCISE – service worker: rende l'app installabile e utilizzabile offline.
   Codice e dati: prima la rete (così gli aggiornamenti arrivano subito), poi la copia salvata.
   Immagini: prima la copia salvata, poi la rete. */
const CACHE = "fisioexercise-v1";
const CORE = [
  "./", "index.html", "app.js", "manifest.webmanifest",
  "esercizi.js", "esercizi-anca.js", "esercizi-cervicale.js", "esercizi-toracico.js", "esercizi-lombare.js",
  "esercizi-spalla.js", "esercizi-gomito.js", "esercizi-polso-mano.js", "esercizi-ginocchio.js", "esercizi-piede-caviglia.js",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// La pagina invia l'elenco delle foto: le salviamo in blocchi per l'uso offline.
self.addEventListener("message", (e) => {
  if (!e.data || e.data.tipo !== "precache" || !Array.isArray(e.data.urls)) return;
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const urls = e.data.urls;
    for (let i = 0; i < urls.length; i += 20) {
      await Promise.all(urls.slice(i, i + 20).map(async (u) => { if (!(await c.match(u))) await c.add(u).catch(() => {}); }));
    }
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // font Google ecc.: lasciati al browser
  const immagine = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url.pathname);
  if (immagine) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    })));
  } else {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html"))));
  }
});
