const version = '16a'
const cacheName = `transportsg-${version}`

function cacheFiles(files) {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(files).then(() => self.skipWaiting())
    .catch(e => {
      console.error(e)
      return ''
    })
  })
}

self.addEventListener('install', e => {
  const timeStamp = Date.now()

  caches.keys().then(function (cachesNames) {
    return Promise.all(cachesNames.map((storedCacheName) => {
      if (storedCacheName === cacheName || !storedCacheName.startsWith('transportsg')) return Promise.resolve()
      return caches.delete(storedCacheName).then(() => {
        console.log('Old cache ' + storedCacheName + ' deleted')
      })
    }))
  })

  e.waitUntil(
    cacheFiles([
      '/static/css/timings/base-style.css',

      '/static/css/base-style.css',
      '/static/css/combined-colours.css',
      '/static/css/index.css',
      '/static/css/search.css',
      '/static/css/textbar-style.css',

      '/static/fonts/Nunito.woff2',

      '/static/images/decals/wheelchair.svg',
      '/static/images/decals/non-wheelchair.svg',

      '/static/images/clear-icons/bus.svg',
      '/static/images/clear-icons/mrt.svg',

      '/static/images/favicon/favicon192.png',
      '/static/images/favicon/favicon512.png',

      '/static/images/home/about.svg',
      '/static/images/home/bookmarks.svg',
      '/static/images/home/nearby.svg',
      '/static/images/home/search.svg',

      '/static/scripts/lookup.js',
      '/static/scripts/map.js',
      '/static/scripts/nearby.js',
      '/static/scripts/search.js',
      '/static/scripts/sw-load.js',
      '/static/scripts/timings.js',
      '/static/scripts/util.js',

      '/',
      '/lookup',
      '/nearby',
      '/search'
    ])
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  if (event.request.method != 'GET') return

  event.respondWith(
    caches.open(cacheName)
    .then(cache => cache.match(event.request, {ignoreSearch: true}))
    .then(response => {
      return response || fetch(event.request)
    })
  )
})
