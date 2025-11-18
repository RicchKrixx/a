// sw.js
const CACHE_NAME = 'site-static-v1'; 

// List all files that are essential for the site to function offline.
const ASSETS_TO_CACHE = [
    '/',               
    '/index.html',     
    '/manifest.json',   
    // Ensure you update these paths if you create CSS or JS files later
    // e.g., '/styles/main.css', '/scripts/app.js'
    '/shop-logo-removebg-preview.png',
    '/shop-logo-removebg-preview.png'
];

// Installation: Cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching essential assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activation: Clean up old caches if the version number (CACHE_NAME) has changed
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch: Serve from cache first, then fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // If resource is in cache, return it
                if (response) {
                    return response;
                }
                // Otherwise, fetch from the network
                return fetch(event.request);
            })
    );
});
