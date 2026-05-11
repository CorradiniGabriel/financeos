import Icon from './Icon.jsx'
import { P } from '../lib/helpers.js'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="slide-up" style={{ background: P.card, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '20px 18px 36px', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: P.text }}>{title}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', padding: 4, display: 'flex' }}>
            <Icon n="x" size={18} color={P.muted} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
