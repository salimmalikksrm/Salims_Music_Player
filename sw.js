// sw.js - Service Worker

const CACHE_NAME = 'music-player-v1';
// List of files to cache. Make sure to include all your music files here!
const urlsToCache = [
    '/', // Caches the root path (index.html)
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    // Add all your music files here:
    '/music/06 - Nee Prashnalu - SenSongsMp3.co.mp3', // Placeholder: Replace with your actual file
    '/music/Sooryudinye-SenSongsMp3.Co.mp3', // Placeholder: Replace with your actual file
    '/music/Theme Music - SenSongsMp3.Co.mp3', // Placeholder: Replace with your actual file
    '/music/mix_12m52s (audio-joiner.com).mp3', // Placeholder: Replace with your actual file
    // Add placeholder images if you use them directly in HTML/CSS
    'https://placehold.co/192x192/4A5568/CBD5E0?text=No+Art',
    'https://placehold.co/192x192/4A5568/CBD5E0?text=Sunset',
    'https://placehold.co/192x192/4A5568/CBD5E0?text=Groove',
    'https://placehold.co/192x192/4A5568/CBD5E0?text=Rain',
    'https://placehold.co/192x192/4A5568/CBD5E0?text=Epic'
];

// Install event: Cache all the necessary assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching assets');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Caching failed', error);
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: Serve cached content first, then fall back to network
self.addEventListener('fetch', (event) => {
    // Only handle HTTP/HTTPS requests, not chrome-extension:// etc.
    if (event.request.url.startsWith('http')) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // If cached, return the cached response
                    if (response) {
                        console.log('Service Worker: Serving from cache:', event.request.url);
                        return response;
                    }
                    // If not cached, fetch from network
                    console.log('Service Worker: Fetching from network:', event.request.url);
                    return fetch(event.request)
                        .then((networkResponse) => {
                            // Cache new responses for future use
                            // Check if we received a valid response
                            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                                return networkResponse;
                            }
                            // IMPORTANT: Clone the response. A response is a stream and can only be consumed once.
                            // We want to consume it once to return it to the browser and once to cache it.
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            return networkResponse;
                        })
                        .catch(() => {
                            // This catch block handles network errors.
                            // You could return a fallback page for offline use if needed.
                            console.error('Service Worker: Network request failed for:', event.request.url);
                            // For audio, if it's not in cache and network fails, it simply won't play.
                            // For HTML/CSS/JS, you might want to return an offline page.
                            // Example: return caches.match('/offline.html');
                        });
                })
        );
    }
});

// Optional: Handle media session events if you want to control playback from SW
// This is less common as Media Session API is usually handled in the main thread (app.js)
// But SW can be used for more advanced background audio scenarios.
// For this simple player, app.js handles Media Session.
