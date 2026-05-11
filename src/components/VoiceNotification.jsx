import { useState, useEffect, useRef } from 'react'
import { fmt, P } from '../lib/helpers.js'

export default function VoiceNotification({ preview, appData, onConfirm, onRedo }) {
  const [countdown, setCountdown] = useState(5)
  const [pct, setPct] = useState(100)
  const [visible, setVisible] = useState(false)
  const confirmed = useRef(false)

  const getCat  = id => appData.categories?.find(c => c.id === id)
  const getCard = id => appData.creditCards?.find(c => c.id === id)
  const getCC   = id => appData.costCenters?.find(c => c.id === id)

  useEffect(() => {
    // slide in
    requestAnimationFrame(() => setVisible(true))

    const tick = setInterval(() => {
      setCountdown(c => {
        const next = c - 1
        setPct(next * 20)
        if (next <= 0) {
          clearInterval(tick)
          if (!confirmed.current) {
            confirmed.current = true
            // haptic
            if (navigator.vibrate) navigator.vibrate([40, 30, 40])
            onConfirm()
          }
        }
        return next
      })
    }, 1000)

    return () => clearInterval(tick)
  }, [])

  const handleConfirm = () => {
    if (confirmed.current) return
    confirmed.current = true
    if (navigator.vibrate) navigator.vibrate([40, 30, 80])
    onConfirm()
  }

  const handleRedo = () => {
    confirmed.current = true
    onRedo()
  }

  if (!preview) return null

  const cat  = getCat(preview.categoryId)
  const card = getCard(preview.cardId)
  const cc   = getCC(preview.costCenterId)
  const typeColor = preview.type === 'income' ? '#16a34a' : preview.type === 'investment' ? '#2563eb' : '#dc2626'
  const signal    = preview.type === 'income' ? '+' : '−'

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform .35s cubic-bezier(.32,.72,0,1)',
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', border: `1px solid ${P.border}`, borderBottom: 'none', padding: '16px 18px 28px', boxShadow: '0 -4px 24px rgba(0,0,0,.1)' }}>

        {/* Progress bar */}
        <div style={{ height: 3, background: P.border, borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct > 40 ? P.gold : pct > 20 ? '#f59e0b' : '#ef4444', borderRadius: 2, transition: 'width 1s linear, background .3s' }}/>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: P.primaryL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎙️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>FinanceOS · Lançamento identificado</div>
            <div style={{ fontSize: 11, color: P.muted }}>Confirmando em {countdown}s · toque para interagir</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: pct > 40 ? '#f0fdf4' : pct > 20 ? '#fffbeb' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: pct > 40 ? '#16a34a' : pct > 20 ? '#d97706' : '#dc2626' }}>
            {countdown}
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: P.light, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: typeColor }}>{signal}{fmt(preview.amount || 0)}</div>
              <div style={{ fontSize: 12, color: P.text, marginTop: 2 }}>{preview.description}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {preview.confidence && (
                <div style={{ fontSize: 10, color: preview.confidence > 0.8 ? '#16a34a' : '#f59e0b', fontWeight: 600, background: preview.confidence > 0.8 ? '#f0fdf4' : '#fffbeb', padding: '2px 7px', borderRadius: 5 }}>
                  IA {Math.round(preview.confidence * 100)}%
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {cat  && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: cat.color + '20', color: cat.color }}>{cat.name}</span>}
            {cc   && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: P.primaryL, color: P.primary }}>{cc.name}</span>}
            {card && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#f5f3ff', color: '#6d28d9' }}>{card.name} ••{card.last_four}</span>}
            {!card && <span style={{ fontSize: 10, color: P.muted, padding: '3px 8px', borderRadius: 6, background: P.border }}>Sem cartão</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleRedo}
            style={{ flex: 1, padding: '12px', background: '#fef2f2', border: 'none', borderRadius: 12, color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🔄 Refazer
          </button>
          <button onClick={handleConfirm}
            style={{ flex: 2, padding: '12px', background: '#16a34a', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            ✅ Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
