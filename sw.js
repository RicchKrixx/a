const CACHE_NAME = 'bixmax-shop-v2'; 

// 1. List everything you want to work offline
const ASSETS_TO_CACHE = [
    '/',                
    '/index.html',      
    '/offline.html',    // <--- IMPORTANT: We added this
    '/manifest.json',   
    '/shop-logo-removebg-preview.png'
    // Removed the duplicate logo entry you had
];

// 2. Install: Cache all the files in the list above
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Bixmax Service Worker: Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 3. Activate: Clean up old versions of the cache
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

// 4. Fetch: The "Smart" Network Logic
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // A. If the file is already in cache (like your logo), return it.
                if (response) {
                    return response;
                }

                // B. If not in cache, try to get it from the internet.
                return fetch(event.request)
                    .catch(() => {
                        // C. IF INTERNET FAILS...
                        // Check if the user was trying to visit a web page (HTML)
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        // If it was just an image or css failing, do nothing.
                    });
            })
    );
});
