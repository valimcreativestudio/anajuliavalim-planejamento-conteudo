// App no celular: guarda a página para abrir rápido e mostra os avisos.
// Os dados sempre vêm da planilha (nada da planilha fica guardado aqui).
const CACHE = "planejamento-v2";
const ARQUIVOS = ["./", "index.html", "config.js", "manifest.webmanifest", "icone-192.png", "icone-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// página: tenta a internet primeiro (para pegar a versão nova) e usa a cópia só sem conexão
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)).catch(() => {}); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => {
    const w = l.find(c => "focus" in c);
    if (w) { w.navigate(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
