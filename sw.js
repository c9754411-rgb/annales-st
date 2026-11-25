/* MedLagh : installation + utilisation hors connexion */
const C='medlagh-v3';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin!==location.origin){                                   // polices et scripts Firebase : copie pour le hors ligne
    if(/gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs|jsdelivr/.test(u.host))
      e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>{ const f=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>m); return m||f; })));
    return; }
  if(r.mode==='navigate'){                                          // page : réseau d'abord
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(C).then(c=>c.put('./index.html',cp)); return res; })
      .catch(()=>caches.match('./index.html'))); return; }
  if(u.pathname.endsWith('.enc')){                                  // modules : réseau d'abord (toujours la dernière version), copie locale si hors ligne
    const k=u.origin+u.pathname;
    e.respondWith(caches.open(C).then(c=>fetch(r,{cache:'no-cache'}).then(res=>{ if(res.ok) c.put(k,res.clone()); return res; }).catch(()=>c.match(k)))); return; }
  // images, PDF, icônes : copie locale, mise à jour en arrière-plan
  e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>{ const f=fetch(r).then(res=>{ if(res.ok) c.put(r,res.clone()); return res; }).catch(()=>m); return m||f; })));
});
