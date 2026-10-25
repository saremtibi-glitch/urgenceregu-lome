/* Service worker : rend les pages disponibles hors ligne.
   - Pages HTML et listes publiques (hôpitaux, lieux) : réseau d'abord, copie en cache si coupure.
   - Scripts, styles et données partagés : réseau d'abord aussi (les mises à jour arrivent sans changer VERSION).
   - Icônes : cache d'abord.
   - Jamais de cache pour les envois (POST…), les WebSocket ni les routes privées. */

const VERSION = 'urgence-v2';
const A_PRECHARGER = [
  '/',
  '/commun/commun.js',
  '/commun/commun.css',
  '/commun/langues-temoin.js',
  '/donnees/hopitaux.json',
  '/donnees/lieux.json',
  '/icones/icone-192.png'
];
const API_PUBLIQUES = ['/api/hopitaux', '/api/lieux'];
const PAGES = ['/', '/index.html', '/hopital.html', '/ambulance.html', '/admin.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(cache => cache.addAll(A_PRECHARGER)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(cle => cle !== VERSION).map(cle => caches.delete(cle))))
      .then(() => self.clients.claim())
  );
});

async function reseauDAbord(requete) {
  const cache = await caches.open(VERSION);
  try {
    const reponse = await fetch(requete, { cache: 'no-cache' });
    if (reponse.ok) cache.put(requete, reponse.clone());
    return reponse;
  } catch (err) {
    const copie = await cache.match(requete, { ignoreSearch: true });
    if (copie) return copie;
    throw err;
  }
}

async function cacheDAbord(requete) {
  const copie = await caches.match(requete);
  if (copie) return copie;
  const reponse = await fetch(requete);
  if (reponse.ok) (await caches.open(VERSION)).put(requete, reponse.clone());
  return reponse;
}

self.addEventListener('fetch', (e) => {
  const requete = e.request;
  if (requete.method !== 'GET') return;
  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return;

  if (PAGES.includes(url.pathname) || API_PUBLIQUES.includes(url.pathname) || /^\/(commun|donnees)\//.test(url.pathname)) {
    e.respondWith(reseauDAbord(requete));
  } else if (url.pathname.startsWith('/icones/')) {
    e.respondWith(cacheDAbord(requete));
  }
});
