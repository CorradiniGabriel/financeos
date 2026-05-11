import { useState } from 'react'
import { Pill, Btn } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { CAT_COLORS, P } from '../lib/helpers.js'

export default function Categories({ appData, onAddCategory, onAddSub }) {
  const { categories = [], costCenters = [], transactions = [] } = appData
  const [expanded, setExpanded] = useState({})
  const [ccFilter, setCcFilter] = useState('all')
  const [adding, setAdding]     = useState(false)
  const [addingSub, setAddingSub] = useState(null)
  const [newName, setNewName]   = useState('')
  const [newType, setNewType]   = useState('expense')
  const [saving, setSaving]     = useState(false)

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }))
  const filtered = ccFilter === 'all' ? categories : categories.filter(c => c.cost_center_id === ccFilter)
  const getCC = id => costCenters.find(c => c.id === id)
  const txCount = catId => transactions.filter(t => t.category_id === catId).length

  const submitCat = async () => {
    if (!newName.trim() || saving) return
    setSaving(true)
    const ccId = ccFilter === 'all' ? (costCenters[0]?.id || null) : ccFilter
    await onAddCategory({ name: newName.trim(), color: CAT_COLORS[categories.length % CAT_COLORS.length], type: newType, cost_center_id: ccId })
    setNewName(''); setAdding(false); setSaving(false)
  }

  const submitSub = async (catId) => {
    if (!newName.trim() || saving) return
    setSaving(true)
    await onAddSub(catId, newName.trim())
    setNewName(''); setAddingSub(null); setSaving(false)
  }

  const inpStyle = { flex: 1, padding: '8px 11px', borderRadius: 9, border: `1px solid ${P.border}`, background: P.light, fontSize: 12, outline: 'none', color: P.text }

  return (
    <div className="fade-in">
      <div style={{ padding: '16px 14px 10px', background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Categorias</div>
          <button onClick={() => { setAdding(true); setNewName('') }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: P.primaryL, border: 'none', borderRadius: 20, color: P.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Icon n="plus" size={13} color={P.primary} /> Nova
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <Pill label="Todos" active={ccFilter === 'all'} onClick={() => setCcFilter('all')} />
          {costCenters.map(c => <Pill key={c.id} label={c.name} active={ccFilter === c.id} color={c.color} onClick={() => setCcFilter(c.id)} />)}
        </div>
      </div>

      <div style={{ padding: '10px 14px 90px' }}>
        <div style={{ fontSize: 10, color: P.muted, marginBottom: 8 }}>Toque para expandir · mantenha para editar</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(cat => {
            const cc = getCC(cat.cost_center_id)
            return (
              <div key={cat.id} style={{ background: P.card, borderRadius: 14, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                <div onClick={() => toggle(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer' }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{cat.name}</div>
                    <div style={{ fontSize: 10, color: P.muted }}>
                      {cc?.name} · {cat.type === 'expense' ? 'Despesa' : 'Receita'} · {txCount(cat.id)} lançamentos
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: P.muted }}>{(cat.subs || []).length} sub</span>
                    <Icon n={expanded[cat.id] ? 'chevd' : 'chevr'} size={15} color={P.muted} />
                  </div>
                </div>

                {expanded[cat.id] && (
                  <div style={{ borderTop: `1px solid ${P.border}` }}>
                    {(cat.subs || []).map(sub => (
                      <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px 9px 34px', borderBottom: `1px solid ${P.light}` }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color + '90', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12, color: '#555' }}>{sub.name}</span>
                        <span style={{ fontSize: 10, color: P.muted }}>{transactions.filter(t => t.sub_id === sub.id).length} lanç.</span>
                      </div>
                    ))}
                    {addingSub === cat.id ? (
                      <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderTop: `1px solid ${P.border}` }}>
                        <input style={inpStyle} autoFocus placeholder="Nome da subcategoria" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitSub(cat.id)} />
                        <button onClick={() => submitSub(cat.id)} style={{ padding: '6px 12px', background: P.green, color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                          {saving ? '...' : 'Ok'}
                        </button>
                        <button onClick={() => { setAddingSub(null); setNewName('') }} style={{ padding: '6px 10px', border: `1px solid ${P.border}`, borderRadius: 8, background: 'transparent', color: P.muted, fontSize: 12 }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingSub(cat.id); setNewName('') }}
                        style={{ width: '100%', padding: '9px 14px 9px 34px', background: 'transparent', border: 'none', color: P.primary, fontSize: 11, textAlign: 'left', cursor: 'pointer' }}>
                        + Adicionar subcategoria
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {adding ? (
            <div style={{ background: P.card, border: `1.5px dashed ${P.primary}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 11, color: P.muted, marginBottom: 8 }}>
                Nova categoria em: {ccFilter === 'all' ? costCenters[0]?.name : costCenters.find(c => c.id === ccFilter)?.name}
              </div>
              <input style={{ ...inpStyle, flex: 'none', width: '100%', marginBottom: 10 }} autoFocus placeholder="Nome da categoria" value={newName} onChange={e => setNewName(e.target.value)} />
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {[['expense', 'Despesa', P.red], ['income', 'Receita', P.green]].map(([v, l, c]) => (
                  <Pill key={v} label={l} active={newType === v} color={c} onClick={() => setNewType(v)} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setAdding(false); setNewName('') }} style={{ flex: 1, padding: '9px', border: `1px solid ${P.border}`, borderRadius: 9, background: 'transparent', color: P.muted, fontSize: 12 }}>Cancelar</button>
                <button onClick={submitCat} style={{ flex: 2, padding: '9px', background: P.primary, color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600 }}>
                  {saving ? 'Salvando...' : 'Criar categoria'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setAdding(true); setNewName('') }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px', border: `1px dashed ${P.border}`, borderRadius: 14, background: 'transparent', color: P.primary, fontSize: 12, cursor: 'pointer', width: '100%' }}>
              <Icon n="plus" size={14} color={P.primary} /> Nova categoria
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
