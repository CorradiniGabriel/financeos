import { P } from '../lib/helpers.js'

export const Badge = ({ label, color = '#3b82f6', bg = '#eff6ff' }) => (
  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: bg, color, fontWeight: 500, whiteSpace: 'nowrap' }}>
    {label}
  </span>
)

export const ProgressBar = ({ pct, color, height = 5 }) => (
  <div style={{ height, background: P.border, borderRadius: height / 2, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color, borderRadius: height / 2, transition: 'width .4s ease' }} />
  </div>
)

export const Pill = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${active ? 'transparent' : P.border}`, background: active ? (color || P.primary) : P.light, color: active ? '#fff' : P.muted, fontSize: 11, fontWeight: active ? 500 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}>
    {label}
  </button>
)

export const Spinner = ({ size = 20 }) => (
  <div className="spin" style={{ width: size, height: size, border: `2px solid ${P.primaryL}`, borderTopColor: P.primary, borderRadius: '50%' }} />
)

export const Btn = ({ children, onClick, color = P.primary, outline, full, style: st, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ padding: '11px 18px', borderRadius: 11, border: outline ? `1px solid ${P.border}` : 'none', background: outline ? 'transparent' : color, color: outline ? P.muted : '#fff', fontWeight: 600, fontSize: 13, width: full ? '100%' : 'auto', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .6 : 1, transition: 'opacity .15s', ...st }}>
    {children}
  </button>
)

export const InputField = ({ label, type = 'text', value, onChange, placeholder, children, style: st }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...st }}>
    {label && <div style={{ fontSize: 11, color: P.muted }}>{label}</div>}
    {children || (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.light, color: P.text, fontSize: 13, outline: 'none', width: '100%' }} />
    )}
  </div>
)

export const SelectField = ({ label, value, onChange, children, style: st }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...st }}>
    {label && <div style={{ fontSize: 11, color: P.muted }}>{label}</div>}
    <select value={value} onChange={onChange}
      style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.light, color: P.text, fontSize: 13, outline: 'none', appearance: 'none', width: '100%' }}>
      {children}
    </select>
  </div>
)
