const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(distDir)) {
  // 1. Disable Jekyll processing so directories starting with an underscore (like _expo) are served
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

  // 2. Prevent git from ignoring static export assets
  fs.writeFileSync(path.join(distDir, '.gitignore'), '');

  // 3. Web PWA Manifest
  const manifest = {
    short_name: 'FinTrack',
    name: 'FinTrack — Budget & Épargne',
    icons: [
      {
        src: './favicon.png',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/png',
      },
    ],
    start_url: './index.html',
    display: 'standalone',
    theme_color: '#0B132B',
    background_color: '#0B132B',
  };
  fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // 4. Offline Service Worker
  const serviceWorkerContent = `
const CACHE_NAME = 'fintrack-offline-v1';
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const cacheCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});
`.trim();
  fs.writeFileSync(path.join(distDir, 'sw.js'), serviceWorkerContent);

  // 5. Inject PWA tags & SW registration into HTML
  const indexPath = path.join(distDir, 'index.html');
  const notFoundPath = path.join(distDir, '404.html');

  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');

    const pwaTags = `
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="#0B132B" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  </script>
</head>`;

    if (!html.includes('manifest.json')) {
      html = html.replace('</head>', pwaTags);
      fs.writeFileSync(indexPath, html, 'utf8');
    }

    fs.copyFileSync(indexPath, notFoundPath);
  }
}
