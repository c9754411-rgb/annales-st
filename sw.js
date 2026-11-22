/* MedLagh : service worker minimal (installation + ouverture hors ligne de la page) */
const C='medlagh-shell-v1';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;            // Firebase, Google, CDN : réseau direct
  if(r.mode==='navigate'){                                                   // page : réseau d'abord, copie hors ligne sinon
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(C).then(c=>c.put('./index.html',cp)); return res; })
      .catch(()=>caches.match('./index.html'))); }
});
