// Notificações nativas do sistema (Android/iOS)
// Usa a Web Notifications API — mostra no sistema operacional

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied')  return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

/**
 * Mostra notificação nativa do sistema com botões Confirmar / Refazer
 * Funciona no Android Chrome e iOS Safari (após instalar como PWA)
 */
export async function showVoiceNotification(preview, appData) {
  const perm = await requestNotificationPermission()
  if (perm !== 'granted') return false

  const fmt = n => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0)
  const cat  = appData.categories?.find(c=>c.id===preview.categoryId)
  const card = appData.creditCards?.find(c=>c.id===preview.cardId)

  const signal = preview.type === 'income' ? '+' : '−'
  const body   = [
    `${signal}${fmt(preview.amount)}`,
    cat  ? cat.name  : '',
    card ? card.name : 'Sem cartão',
    preview.description,
  ].filter(Boolean).join(' · ')

  const sw = await navigator.serviceWorker?.ready

  if (sw) {
    // Notificação via Service Worker (suporta ações/botões)
    await sw.showNotification('FinanceOS — Confirmar lançamento?', {
      body,
      icon:  'icon-192.png',
      badge: 'icon-192.png',
      tag:   'voice-confirm',
      requireInteraction: true,
      data:  preview,
      actions: [
        { action: 'confirm', title: '✅ Confirmar' },
        { action: 'redo',    title: '🔄 Refazer'  },
      ],
      vibrate: [100, 50, 100],
    })
  } else {
    // Fallback — notificação simples (sem botões)
    new Notification('FinanceOS — Confirmar lançamento?', {
      body,
      icon: 'icon-192.png',
      tag:  'voice-confirm',
      requireInteraction: true,
      data: preview,
    })
  }

  return true
}
