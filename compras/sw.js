// Minhas Compras: guarda a página para abrir rápido e funcionar sem internet.
// Os dados ficam no aparelho (e na planilha, se estiver conectada), não aqui.
const CACHE = "compras-v1";
const ARQUIVOS = ["./", "index.html", "config.js", "manifest.webmanifest", "icone-192.png", "icone-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("compras-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// tenta a internet primeiro (versão nova) e usa a cópia só sem conexão
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith(new URL("./", self.registration.scope).pathname)) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)).catch(() => {}); } return r; })
    .catch(() => caches.match(e.request).then(r => r || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
