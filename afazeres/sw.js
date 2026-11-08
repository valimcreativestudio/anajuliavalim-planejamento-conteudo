// Feito!: guarda o app para abrir rápido e funcionar sem internet.
// As tarefas ficam no próprio aparelho (e no Drive, se a sincronização estiver ligada).
const CACHE = "feito-v1";
const ARQUIVOS = ["./", "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("feito-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// tenta a internet primeiro (para pegar a versão nova) e usa a cópia guardada sem conexão
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => {
    const w = l.find(c => "focus" in c);
    return w ? w.focus() : self.clients.openWindow("./#hoje");
  }));
});
