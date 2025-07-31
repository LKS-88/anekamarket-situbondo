// service-worker.js

const CACHE_NAME = 'pos-anekamarketku-v6';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // CSS
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-daterangepicker/3.0.5/daterangepicker.min.css',
  // JS
  'https://code.jquery.com/jquery-3.6.0.min.js',
  'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-daterangepicker/3.0.5/daterangepicker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

// Install: Cache semua aset
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('SW Install Error:', err))
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

// Fetch: Cache-first untuk aset, network-first untuk HTML
self.addEventListener('fetch', event => {
  const { request } = event;
  const isHTML = request.headers.get('accept')?.includes('text/html');
  const isAsset = /\.(js|css|png|jpg|jpeg|svg|woff|woff2|ttf|eot|gif)$/i.test(request.url);
  const isFont = request.url.includes('fonts.googleapis.com') || request.url.includes('gstatic.com');

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

  if (isAsset || isFont) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          return cached || fetch(request)
            .then(res => {
              if (!res.ok || res.type === 'opaque') return res;
              const clone = res.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
              return res;
            })
            .catch(() => caches.match(request.url.split('/').pop().split('?')[0]) || caches.match('./index.html'));
        })
    );
  }
});
