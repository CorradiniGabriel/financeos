// Configurações do usuário persistidas localmente
const KEY = 'fos_settings'

const DEFAULTS = {
  shakeEnabled: true,
  micPermission: 'prompt', // prompt | granted | denied
  theme: 'light',
  language: 'pt-BR',
  autoConfirmVoice: true,
  autoConfirmDelay: 5,
}

export function getSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)||'{}') } } catch { return DEFAULTS }
}

export function saveSettings(updates) {
  const current = getSettings()
  const next = { ...current, ...updates }
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  return next
}

export async function requestMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(t => t.stop())
    saveSettings({ micPermission: 'granted' })
    return 'granted'
  } catch(e) {
    const status = e.name === 'NotAllowedError' ? 'denied' : 'prompt'
    saveSettings({ micPermission: status })
    return status
  }
}

export function getMicStatus() {
  if (!navigator.mediaDevices) return 'unavailable'
  return getSettings().micPermission
}
