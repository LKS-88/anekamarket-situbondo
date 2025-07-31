// service-worker.js

const CACHE_NAME = 'pos-anekamarketku-v3'; // Naikkan versi
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Logo-Anekamarketku.png', // Simpan lokal!
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

// ✅ Install: Cache semua resource penting
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error('Failed to cache:', err))
  );
});

// ✅ Activate: Hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// ✅ Fetch: Gunakan cache jika offline
self.addEventListener('fetch', event => {
  const isResource = event.request.destination === 'script' ||
                     event.request.destination === 'style' ||
                     event.request.destination === 'font' ||
                     event.request.destination === 'image';

  if (isResource) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request).catch(() => caches.match(event.request));
        })
    );
  } else {
    // Untuk HTML, prioritaskan jaringan, fallback ke cache
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match('./index.html'))
      );
    }
  }
});
