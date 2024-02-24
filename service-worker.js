const CACHE_NAME = 'trip-tally-cache-v1';

const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/assets/icon.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
    caches.open(CACHE_NAME)
        .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
    caches.match(event.request)
        .then(response => {
        if (response) {
            return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
            .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
                .then(cache => {
                cache.put(event.request, responseToCache);
                });

            return response;
            });
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
    caches.keys().then(cacheNames => {
        return Promise.all(
        cacheNames.filter(cacheName => {
            return cacheName.startsWith('trip-tally-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
            return caches.delete(cacheName);
        })
        );
    })
    );
});
