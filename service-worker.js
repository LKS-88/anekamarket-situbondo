// service-worker.js

const CACHE_NAME = 'pos-anekamarketku-v4'; // versi dinaikkan
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Logo-Anekamarketku.png',
  './icon-192.png', // tambahkan jika ada
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://code.jquery.com/jquery-3.6.0.min.js',
  'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-daterangepicker/3.0.5/daterangepicker.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-daterangepicker/3.0.5/daterangepicker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

// Install: Cache semua aset
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Failed to cache during install:', err))
  );
});

// Activate: Hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Gunakan cache jika offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const isResource = ['script', 'style', 'font', 'image', 'document'].includes(request.destination);
  const isHTML = request.headers.get('accept')?.includes('text/html');

  // Cache HTML (index.html)
  if (isHTML) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache resource (CSS, JS, font, image)
  if (isResource) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request)
            .then(res => {
              if (res.status === 404) return res;
              const clone = res.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
              return res;
            })
            .catch(() => caches.match(request.url.split('/').pop()) || caches.match('./index.html'));
        })
    );
  }
});

// Optional: Cache font dari Google Fonts (gstatic.com)
self.addEventListener('fetch', event => {
  if (event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request)
          .then(res => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return res;
          })
        )
    );
  }
});
