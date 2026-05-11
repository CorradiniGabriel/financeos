import { useState, useEffect } from 'react'
import Modal from './Modal.jsx'
import { InputField, SelectField, Pill, Btn } from './ui.jsx'
import { today, P } from '../lib/helpers.js'

export default function AddTransactionModal({ open, onClose, onAdd, appData, prefill }) {
  const blank = { description: '', amount: '', type: 'expense', categoryId: '', subId: '', costCenterId: '', cardId: '', date: today() }
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setForm(prefill ? { ...blank, ...prefill } : blank)
  }, [open, prefill])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const filteredCats = appData.categories.filter(c =>
    c.type === form.type && (!form.costCenterId || c.cost_center_id === form.costCenterId)
  )
  const selCat = appData.categories.find(c => c.id === form.categoryId)

  const submit = async () => {
    if (!form.description || !form.amount) return
    setLoading(true)
    await onAdd({
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      category_id: form.categoryId || null,
      sub_id: form.subId || null,
      cost_center_id: form.costCenterId || null,
      card_id: form.cardId || null,
      date: form.date || today(),
    })
    setLoading(false)
    onClose()
  }

  const inp = { padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.light, color: P.text, fontSize: 13, outline: 'none', width: '100%', appearance: 'none' }

  return (
    <Modal open={open} onClose={onClose} title="Novo lançamento">
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        <Pill label="Despesa" active={form.type === 'expense'} color={P.red}  onClick={() => { set('type', 'expense'); set('categoryId', '') }} />
        <Pill label="Receita" active={form.type === 'income'}  color={P.green} onClick={() => { set('type', 'income');  set('categoryId', '') }} />
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <InputField label="Descrição">
          <input style={inp} placeholder="Ex: Supermercado" value={form.description} onChange={e => set('description', e.target.value)} />
        </InputField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <InputField label="Valor (R$)">
            <input style={inp} type="number" placeholder="0,00" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </InputField>
          <InputField label="Data">
            <input style={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </InputField>
        </div>

        <InputField label="Centro de custo">
          <select style={inp} value={form.costCenterId} onChange={e => { set('costCenterId', e.target.value); set('categoryId', '') }}>
            <option value="">Todos</option>
            {appData.costCenters.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </InputField>

        <InputField label="Categoria">
          <select style={inp} value={form.categoryId} onChange={e => { set('categoryId', e.target.value); set('subId', '') }}>
            <option value="">Selecionar...</option>
            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </InputField>

        {selCat?.subs?.length > 0 && (
          <InputField label="Subcategoria">
            <select style={inp} value={form.subId} onChange={e => set('subId', e.target.value)}>
              <option value="">Selecionar...</option>
              {selCat.subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </InputField>
        )}

        {form.type === 'expense' && (
          <InputField label="Cartão (opcional)">
            <select style={inp} value={form.cardId} onChange={e => set('cardId', e.target.value)}>
              <option value="">Sem cartão (débito / dinheiro)</option>
              {appData.creditCards.map(c => <option key={c.id} value={c.id}>{c.name} •••• {c.last_four}</option>)}
            </select>
          </InputField>
        )}
      </div>

      <Btn full color={P.primary} onClick={submit} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? 'Salvando...' : 'Confirmar lançamento'}
      </Btn>
    </Modal>
  )
}
