const CACHE = 'financeos-v2'
const SHELL = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png']

// Instalação
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  )
})

// Ativação — limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Fetch — serve do cache quando offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      })
      .catch(() =>
        caches.match(e.request)
          .then(r => r || caches.match('./index.html'))
      )
  )
})

// Clique em notificação nativa
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const action = e.action
  const data   = e.notification.data || {}

  if (action === 'confirm') {
    // Envia mensagem para o app confirmar o lançamento
    e.waitUntil(
      self.clients.matchAll({ type:'window' }).then(clients => {
        if (clients.length) {
          clients[0].postMessage({ type:'VOICE_CONFIRM', payload: data })
          clients[0].focus()
        } else {
          self.clients.openWindow('./?action=confirm&data=' + encodeURIComponent(JSON.stringify(data)))
        }
      })
    )
  } else if (action === 'redo') {
    e.waitUntil(
      self.clients.matchAll({ type:'window' }).then(clients => {
        if (clients.length) {
          clients[0].postMessage({ type:'VOICE_REDO', payload: data })
          clients[0].focus()
        } else {
          self.clients.openWindow('./')
        }
      })
    )
  } else {
    // Toque na notificação sem ação → abre o app
    e.waitUntil(
      self.clients.matchAll({ type:'window' }).then(clients => {
        if (clients.length) { clients[0].focus() }
        else { self.clients.openWindow('./') }
      })
    )
  }
})
