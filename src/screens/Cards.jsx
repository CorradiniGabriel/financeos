import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { ProgressBar } from '../components/ui.jsx'
import { fmt, P } from '../lib/helpers.js'

const STATUS = {
  open:    { label: 'Em aberto',     bg: '#eff6ff', color: '#2563eb' },
  pending: { label: 'Aguarda pagto.',bg: '#fffbeb', color: '#d97706' },
  paid:    { label: 'Paga',          bg: '#f0fdf4', color: '#16a34a' },
}

export default function Cards({ appData, onAddCard, onPayBill }) {
  const { creditCards = [], costCenters = [], transactions = [] } = appData
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', last_four: '', color: '#3b82f6', closing_day: 15, due_day: 22, limit_amount: 5000, cost_center_id: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.last_four || saving) return
    setSaving(true)
    await onAddCard({ ...form, closing_day: Number(form.closing_day), due_day: Number(form.due_day), limit_amount: Number(form.limit_amount), current_bill: 0, status: 'open' })
    setAdding(false); setSaving(false); setForm({ name: '', last_four: '', color: '#3b82f6', closing_day: 15, due_day: 22, limit_amount: 5000, cost_center_id: '' })
  }

  const inp = { width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid ${P.border}`, background: P.light, fontSize: 12, outline: 'none', appearance: 'none', color: P.text }
  const CARD_COLORS = ['#6d28d9','#f59e0b','#0ea5e9','#ef4444','#22c55e','#f472b6','#0f172a']

  return (
    <div className="fade-in">
      <div style={{ padding: '16px 14px 10px', background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Cartões de crédito</div>
          <button onClick={() => setAdding(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: P.primaryL, border: 'none', borderRadius: 20, color: P.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Icon n="plus" size={13} color={P.primary} /> Novo
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 14px 90px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {creditCards.map(card => {
          const st = STATUS[card.status] || STATUS.open
          const pct = Math.min((Number(card.current_bill || 0) / Number(card.limit_amount || 1)) * 100, 100)
          const txCount = transactions.filter(t => t.card_id === card.id).length
          return (
            <div key={card.id} style={{ background: P.card, borderRadius: 18, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
              {/* Topo colorido */}
              <div style={{ background: card.color, padding: '18px 18px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{card.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>•••• •••• •••• {card.last_four}</div>
                  </div>
                  <span style={{ background: st.bg, color: st.color, fontSize: 10, padding: '3px 9px', borderRadius: 6, fontWeight: 600 }}>{st.label}</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}>Fatura atual</span>
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{fmt(card.current_bill || 0)} / {fmt(card.limit_amount)}</span>
                  </div>
                  <ProgressBar pct={pct} color="rgba(255,255,255,.9)" height={4} />
                </div>
              </div>
              {/* Detalhes */}
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[['Fecha', `Dia ${card.closing_day}`], ['Vence', `Dia ${card.due_day}`], ['Lançamentos', txCount]].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{v}</div>
                      <div style={{ fontSize: 9, color: P.muted, marginTop: 1 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: P.muted, background: P.light, borderRadius: 8, padding: '7px 10px', marginBottom: 10 }}>
                  <b style={{ color: P.text }}>⚡ Regime de caixa:</b> despesas neste cartão só impactam o saldo ao pagar a fatura.
                </div>
                {card.status !== 'paid' && Number(card.current_bill || 0) > 0 && (
                  <button onClick={() => onPayBill(card.id)}
                    style={{ width: '100%', padding: '11px', background: P.green, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Registrar pagamento — {fmt(card.current_bill)}
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Formulário de novo cartão */}
        {adding && (
          <div style={{ background: P.card, border: `1.5px dashed ${P.primary}`, borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 14 }}>Novo cartão</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[['name','Nome do cartão','text'],['last_four','Últimos 4 dígitos','text'],['limit_amount','Limite (R$)','number'],['closing_day','Dia de fechamento','number'],['due_day','Dia de vencimento','number']].map(([k,l,t]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: P.muted, marginBottom: 3 }}>{l}</div>
                  <input style={inp} type={t} value={form[k]} onChange={e => set(k, e.target.value)} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 6 }}>Cor do cartão</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CARD_COLORS.map(c => (
                    <button key={c} onClick={() => set('color', c)}
                      style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid ' + P.text : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: P.muted, marginBottom: 3 }}>Centro de custo</div>
                <select style={inp} value={form.cost_center_id} onChange={e => set('cost_center_id', e.target.value)}>
                  <option value="">Selecionar...</option>
                  {costCenters.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => setAdding(false)} style={{ flex: 1, padding: '10px', border: `1px solid ${P.border}`, borderRadius: 10, background: 'transparent', color: P.muted, fontSize: 13 }}>Cancelar</button>
              <button onClick={submit} style={{ flex: 2, padding: '10px', background: P.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
                {saving ? 'Salvando...' : 'Adicionar cartão'}
              </button>
            </div>
          </div>
        )}

        {!adding && (
          <button onClick={() => setAdding(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px', border: `1px dashed ${P.border}`, borderRadius: 18, background: 'transparent', color: P.primary, fontSize: 12, cursor: 'pointer', width: '100%' }}>
            <Icon n="plus" size={14} color={P.primary} /> Adicionar cartão
          </button>
        )}
      </div>
    </div>
  )
}
