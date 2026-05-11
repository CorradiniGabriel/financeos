import { useState } from 'react'
import { ProgressBar } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { fmt, fmtShort, GOAL_ICONS, CAT_COLORS, P } from '../lib/helpers.js'

export default function Goals({ appData, onAddGoal, onUpdateGoal }) {
  const { goals = [], costCenters = [] } = appData
  const [adding, setAdding]   = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm] = useState({ name: '', target: '', current: '0', deadline: '', cost_center_id: '', icon: '🎯' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.target || saving) return
    setSaving(true)
    await onAddGoal({ ...form, target: Number(form.target), current: Number(form.current || 0), color: CAT_COLORS[goals.length % CAT_COLORS.length] })
    setSaving(false); setAdding(false); setForm({ name: '', target: '', current: '0', deadline: '', cost_center_id: '', icon: '🎯' })
  }

  const contribute = async (goal, amount) => {
    const newCurrent = Math.min(Number(goal.current || 0) + amount, Number(goal.target))
    await onUpdateGoal(goal.id, { current: newCurrent })
  }

  const inp = { width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid ${P.border}`, background: P.light, fontSize: 12, outline: 'none', appearance: 'none', color: P.text }

  return (
    <div className="fade-in">
      <div style={{ padding: '16px 14px 10px', background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Metas financeiras</div>
          <button onClick={() => setAdding(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: P.primaryL, border: 'none', borderRadius: 20, color: P.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Icon n="plus" size={13} color={P.primary} /> Nova
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 14px 90px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {goals.length === 0 && !adding && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: P.muted, fontSize: 13 }}>
            Nenhuma meta cadastrada ainda.
          </div>
        )}

        {goals.map(g => {
          const cur = Number(g.current || 0)
          const tgt = Number(g.target || 1)
          const pct = Math.round((cur / tgt) * 100)
          const remaining = tgt - cur
          const cc = costCenters.find(c => c.id === g.cost_center_id)
          return (
            <div key={g.id} style={{ background: P.card, borderRadius: 18, border: `1px solid ${P.border}`, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: g.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {g.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: P.text }}>{g.name}</div>
                  <div style={{ fontSize: 11, color: P.muted }}>
                    {cc?.name && `${cc.name} · `}Meta: {fmt(tgt)}{g.deadline ? ` · Prazo: ${g.deadline}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: g.color }}>{pct}%</div>
                </div>
              </div>

              <ProgressBar pct={pct} color={g.color} height={8} />

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0 14px' }}>
                <span style={{ fontSize: 11, color: P.muted }}>Guardado: {fmt(cur)}</span>
                <span style={{ fontSize: 11, color: P.muted }}>Faltam: {fmt(remaining)}</span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {[50, 100, 500, 1000].map(v => (
                  <button key={v} onClick={() => contribute(g, v)}
                    style={{ flex: 1, padding: '8px 4px', border: `1px solid ${g.color}40`, borderRadius: 9, background: g.color + '12', color: g.color, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    +{fmtShort(v)}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {adding && (
          <div style={{ background: P.card, border: `1.5px dashed ${P.primary}`, borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: P.text, marginBottom: 12 }}>Nova meta</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {GOAL_ICONS.map(ic => (
                <button key={ic} onClick={() => set('icon', ic)}
                  style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${form.icon === ic ? P.primary : P.border}`, background: form.icon === ic ? P.primaryL : 'transparent', fontSize: 20, cursor: 'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[['name','Nome da meta','text','Ex: Viagem Europa'],['target','Valor alvo (R$)','number','20000'],['current','Valor já guardado (R$)','number','0'],['deadline','Prazo','month','']].map(([k,l,t,ph]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, color: P.muted, marginBottom: 3 }}>{l}</div>
                  <input style={inp} type={t} placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)} />
                </div>
              ))}
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
                {saving ? 'Salvando...' : 'Criar meta'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
