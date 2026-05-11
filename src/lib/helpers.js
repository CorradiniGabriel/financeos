// ── Paleta FinanceOS — Navy + Gold ────────────────────────
export const P = {
  // Backgrounds
  bg:       '#f8f9fb',
  card:     '#ffffff',
  border:   '#eeefee',
  light:    '#f5f5f7',

  // Navy primário
  primary:  '#0D1B3E',
  primaryL: 'rgba(13,27,62,0.07)',

  // Ouro — acento
  gold:     '#C9A55A',
  goldL:    'rgba(201,165,90,0.12)',
  goldM:    'rgba(201,165,90,0.25)',

  // Textos
  text:     '#0D1B3E',
  muted:    '#8a9ab0',

  // Status
  green:    '#22c55e',
  greenL:   '#f0fdf4',
  red:      '#ef4444',
  redL:     '#fef2f2',
  amber:    '#f59e0b',
  amberL:   '#fffbeb',
  blue:     '#3b82f6',
  purple:   '#7c3aed',
}

export const fmt = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0)

export const fmtShort = (n) =>
  n >= 1000 ? `R$${(n / 1000).toFixed(1)}k` : `R$${Number(n).toFixed(0)}`

export const today = () => new Date().toISOString().split('T')[0]

export const uid = () => Math.random().toString(36).slice(2, 9)

export const fmtDate = (d) => {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export const CAT_COLORS = [
  '#C9A55A', '#0D1B3E', '#3b82f6', '#22c55e',
  '#ef4444', '#f472b6', '#06b6d4', '#84cc16', '#f97316',
]

export const GOAL_ICONS = ['🎯','✈️','🚗','🏠','📱','💍','🎓','🛡️','🏋️','🌎','🚀','💻']
