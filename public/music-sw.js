/**
 * Service Worker for Music Streaming
 * Handles offline caching of manifests and audio packages
 */

const CACHE_NAME = 'movie-hub-music-v1';
const MANIFEST_CACHE = 'music-manifests-v1';
const PACKAGE_CACHE = 'music-packages-v1';

// Install event - setup caches
self.addEventListener('install', (event) => {
  console.log('[Music SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME),
      caches.open(MANIFEST_CACHE),
      caches.open(PACKAGE_CACHE)
    ]).then(() => {
      console.log('[Music SW] Caches created');
      self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Music SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('movie-hub-music-') && name !== CACHE_NAME;
          })
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      console.log('[Music SW] Old caches cleaned');
      return self.clients.claim();
    })
  );
});

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle music API requests
  if (!url.pathname.startsWith('/api/music')) {
    return;
  }

  // Handle manifest requests
  if (url.pathname.includes('/manifest')) {
    event.respondWith(handleManifestRequest(event.request));
    return;
  }

  // Handle package requests
  if (url.pathname.includes('/package/')) {
    event.respondWith(handlePackageRequest(event.request));
    return;
  }

  // Handle search requests (network-first)
  if (url.pathname.includes('/search')) {
    event.respondWith(handleSearchRequest(event.request));
    return;
  }
});

/**
 * Handle manifest requests - Cache-first strategy
 */
async function handleManifestRequest(request) {
  try {
    const cache = await caches.open(MANIFEST_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[Music SW] Manifest from cache:', request.url);
      
      // Update cache in background
      fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
        })
        .catch(() => {
          // Ignore network errors
        });

      return cached;
    }

    // Fetch from network
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Music SW] Manifest error:', error);
    
    // Try cache as fallback
    const cache = await caches.open(MANIFEST_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    return new Response(
      JSON.stringify({ error: 'Offline and no cached manifest' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle package requests - Cache-first with network fallback
 */
async function handlePackageRequest(request) {
  try {
    const cache = await caches.open(PACKAGE_CACHE);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[Music SW] Package from cache:', request.url);
      return cached;
    }

    // Fetch from network
    const response = await fetch(request);
    
    if (response.ok && response.status === 206) {
      // Cache successful package downloads
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Music SW] Package error:', error);
    
    // Try cache as fallback
    const cache = await caches.open(PACKAGE_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    return new Response(null, { status: 503 });
  }
}

/**
 * Handle search requests - Network-first strategy
 */
async function handleSearchRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Music SW] Search error:', error);
    
    // Try cache as fallback
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    return new Response(
      JSON.stringify({ error: 'Offline and no cached results' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_MUSIC_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(MANIFEST_CACHE),
        caches.delete(PACKAGE_CACHE),
        caches.delete(CACHE_NAME)
      ]).then(() => {
        console.log('[Music SW] All music caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      })
    );
  }
});

/**
 * Calculate total cache size
 */
async function getCacheSize() {
  const cacheNames = [CACHE_NAME, MANIFEST_CACHE, PACKAGE_CACHE];
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

console.log('[Music SW] Service Worker loaded');
