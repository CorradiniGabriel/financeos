const KEY = 'fos_voice_history'
const MAX = 10

export function getVoiceHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function addToVoiceHistory(entry) {
  // entry = { text, preview, date }
  const history = getVoiceHistory()
  const updated = [
    { ...entry, date: new Date().toISOString() },
    ...history.filter(h => h.text !== entry.text),
  ].slice(0, MAX)
  try { localStorage.setItem(KEY, JSON.stringify(updated)) } catch {}
}

export function clearVoiceHistory() {
  try { localStorage.removeItem(KEY) } catch {}
}
