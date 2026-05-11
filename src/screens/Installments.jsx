import { useState } from 'react'
import { fmt, fmtDate, uid, today, P } from '../lib/helpers.js'
import Icon from '../components/Icon.jsx'
import Modal from '../components/Modal.jsx'
import { Btn } from '../components/ui.jsx'

export default function Installments({ appData, onAddInstallment, onAddRecurring }) {
  const { installments=[], recurring=[], categories=[], creditCards=[], costCenters=[] } = appData
  const [addType, setAddType] = useState(null) // 'installment' | 'recurring'
  const [form, setForm] = useState({})
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const inp = { width:'100%', padding:'9px 11px', borderRadius:9, border:`1px solid ${P.border}`, background:'#f8f9fb', fontSize:12, outline:'none', color:P.text, appearance:'none' }

  const getCat = id => categories.find(c=>c.id===id)

  const submitInstallment = () => {
    if (!form.description || !form.total_amount || !form.installment_count) return
    onAddInstallment({ id:uid(), description:form.description, total_amount:Number(form.total_amount), installment_count:Number(form.installment_count), current_installment:1, start_date:form.start_date||today(), category_id:form.category_id||null, card_id:form.card_id||null, cost_center_id:form.cost_center_id||'personal' })
    setAddType(null); setForm({})
  }

  const submitRecurring = () => {
    if (!form.description || !form.amount) return
    onAddRecurring({ id:uid(), description:form.description, amount:Number(form.amount), type:form.type||'expense', frequency:form.frequency||'monthly', next_date:form.next_date||today(), category_id:form.category_id||null, cost_center_id:form.cost_center_id||'personal' })
    setAddType(null); setForm({})
  }

  const Section = ({ title, icon, children, onAdd, addLabel }) => (
    <div style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:14, marginBottom:14, overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:`1px solid ${P.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>{icon}</span>
          <span style={{ fontSize:14, fontWeight:600, color:P.text }}>{title}</span>
          <span style={{ fontSize:11, background:P.primaryL, color:P.primary, padding:'1px 7px', borderRadius:10, fontWeight:600 }}>{children?.props?.children?.length||0}</span>
        </div>
        <button onClick={onAdd} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', background:P.primaryL, border:'none', borderRadius:8, color:P.primary, fontSize:11, fontWeight:600, cursor:'pointer' }}>
          <Icon n="plus" size={13} color={P.primary}/>{addLabel}
        </button>
      </div>
      {children}
    </div>
  )

  return (
    <div className="fade-in" style={{ padding:'24px 28px', maxWidth:900 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:P.text, marginBottom:4 }}>Parcelas & Recorrentes</h1>
      <p style={{ fontSize:13, color:P.muted, marginBottom:24 }}>Compras parceladas, recorrentes e compromissos futuros</p>

      {/* Parceladas */}
      <Section title="Compras/despesas parceladas" icon="🏷️" onAdd={()=>{setAddType('installment');setForm({})}} addLabel="Nova parcela">
        <div>
          {installments.length===0 ? (
            <div style={{ padding:'20px', textAlign:'center', color:P.muted, fontSize:13 }}>Nenhuma compra parcelada registrada.</div>
          ) : installments.map(inst => {
            const pct = Math.round((inst.current_installment/inst.installment_count)*100)
            const monthly = inst.total_amount/inst.installment_count
            const remaining = inst.installment_count - inst.current_installment
            const cat = getCat(inst.category_id)
            const card = inst.card_id ? creditCards.find(c=>c.id===inst.card_id) : null
            return (
              <div key={inst.id} style={{ padding:'14px 18px', borderBottom:`1px solid ${P.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:P.text }}>{inst.description}</div>
                    <div style={{ display:'flex', gap:6, marginTop:3 }}>
                      {cat && <span style={{ fontSize:10, background:cat.color+'20', color:cat.color, padding:'2px 7px', borderRadius:4, fontWeight:500 }}>{cat.name}</span>}
                      {card && <span style={{ fontSize:10, background:'#f5f3ff', color:'#6d28d9', padding:'2px 7px', borderRadius:4, fontWeight:500 }}>{card.name}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#dc2626' }}>{fmt(monthly)}/mês</div>
                    <div style={{ fontSize:11, color:P.muted }}>{inst.current_installment}/{inst.installment_count} · {remaining} restantes</div>
                  </div>
                </div>
                <div style={{ height:6, background:P.border, borderRadius:3, overflow:'hidden', marginBottom:4 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:P.primary, borderRadius:3 }}/>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:P.muted }}>
                  <span>Total: {fmt(inst.total_amount)}</span>
                  <span>{pct}% pago · {fmt(monthly*remaining)} restante</span>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Recorrentes */}
      <Section title="Compras/despesas recorrentes" icon="🔄" onAdd={()=>{setAddType('recurring');setForm({type:'expense',frequency:'monthly'})}} addLabel="Nova recorrente">
        <div>
          {recurring.length===0 ? (
            <div style={{ padding:'20px', textAlign:'center', color:P.muted, fontSize:13 }}>Nenhum lançamento recorrente. Crie ao adicionar uma despesa marcando "Lançamento recorrente".</div>
          ) : recurring.map(rec => {
            const cat = getCat(rec.category_id)
            const typeColor = rec.type==='income'?'#16a34a':rec.type==='investment'?'#2563eb':'#dc2626'
            return (
              <div key={rec.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 18px', borderBottom:`1px solid ${P.border}` }}>
                <div style={{ width:38, height:38, borderRadius:10, background:(cat?.color||'#ccc')+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {rec.type==='income'?'💰':rec.type==='investment'?'📈':'💸'}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:P.text }}>{rec.description}</div>
                  <div style={{ display:'flex', gap:5, marginTop:2 }}>
                    {cat && <span style={{ fontSize:10, background:cat.color+'20', color:cat.color, padding:'2px 6px', borderRadius:4 }}>{cat.name}</span>}
                    <span style={{ fontSize:10, background:P.primaryL, color:P.primary, padding:'2px 6px', borderRadius:4 }}>Mensal</span>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:typeColor }}>{fmt(rec.amount)}</div>
                  <div style={{ fontSize:10, color:P.muted }}>Próximo: {fmtDate(rec.next_date)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Compromissos futuros */}
      <div style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${P.border}` }}>
          <div style={{ fontSize:14, fontWeight:600, color:P.text }}>📅 Compromissos futuros (próximos 30 dias)</div>
        </div>
        {recurring.length===0 ? (
          <div style={{ padding:'20px', textAlign:'center', color:P.muted, fontSize:13 }}>Nenhum compromisso futuro lançado.</div>
        ) : (
          <div>
            {recurring.sort((a,b)=>a.next_date?.localeCompare(b.next_date)).map(rec => {
              const cat = getCat(rec.category_id)
              const daysLeft = Math.ceil((new Date(rec.next_date)-new Date())/(1000*60*60*24))
              const typeColor = rec.type==='income'?'#16a34a':rec.type==='investment'?'#2563eb':'#dc2626'
              return (
                <div key={rec.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 18px', borderBottom:`1px solid ${P.border}` }}>
                  <div style={{ width:40, textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontSize:16, fontWeight:700, color: daysLeft<=3?'#dc2626':daysLeft<=7?'#f59e0b':P.primary }}>{daysLeft}</div>
                    <div style={{ fontSize:9, color:P.muted }}>dias</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:P.text }}>{rec.description}</div>
                    <div style={{ fontSize:10, color:P.muted }}>{fmtDate(rec.next_date)}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:typeColor }}>{fmt(rec.amount)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal parcela */}
      <Modal open={addType==='installment'} onClose={()=>setAddType(null)} title="Nova compra parcelada">
        <div style={{ display:'grid', gap:10 }}>
          {[['description','Descrição','text'],['total_amount','Valor total (R$)','number'],['installment_count','Número de parcelas','number'],['start_date','Data início','date']].map(([k,l,t])=>(
            <div key={k}><div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>{l}</div>
            <input style={inp} type={t} value={form[k]||''} onChange={e=>set(k,e.target.value)}/></div>
          ))}
          <div><div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Categoria</div>
          <select style={inp} value={form.category_id||''} onChange={e=>set('category_id',e.target.value)}>
            <option value="">Selecionar...</option>
            {categories.filter(c=>c.type==='expense').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
          <div><div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Cartão</div>
          <select style={inp} value={form.card_id||''} onChange={e=>set('card_id',e.target.value)}>
            <option value="">Sem cartão</option>
            {creditCards.map(c=><option key={c.id} value={c.id}>{c.name} ••{c.last_four}</option>)}
          </select></div>
          {form.total_amount && form.installment_count && (
            <div style={{ background:P.primaryL, borderRadius:8, padding:'8px 12px', fontSize:12, color:P.primary }}>
              Parcela mensal: <strong>{fmt(form.total_amount/form.installment_count)}</strong>
            </div>
          )}
        </div>
        <Btn full color={P.primary} onClick={submitInstallment} style={{ marginTop:14 }}>Adicionar parcelamento</Btn>
      </Modal>

      {/* Modal recorrente */}
      <Modal open={addType==='recurring'} onClose={()=>setAddType(null)} title="Nova despesa recorrente">
        <div style={{ display:'grid', gap:10 }}>
          <div style={{ display:'flex', gap:6 }}>
            {[['expense','Despesa','#dc2626'],['income','Receita','#16a34a'],['investment','Invest.','#2563eb']].map(([v,l,c])=>(
              <button key={v} onClick={()=>set('type',v)} style={{ flex:1, padding:'7px', border:`1px solid ${(form.type||'expense')===v?c:P.border}`, borderRadius:8, background:(form.type||'expense')===v?c+'15':'transparent', color:(form.type||'expense')===v?c:P.muted, fontSize:12, fontWeight:(form.type||'expense')===v?600:400, cursor:'pointer' }}>{l}</button>
            ))}
          </div>
          {[['description','Descrição','text'],['amount','Valor (R$)','number'],['next_date','Próxima data','date']].map(([k,l,t])=>(
            <div key={k}><div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>{l}</div>
            <input style={inp} type={t} value={form[k]||''} onChange={e=>set(k,e.target.value)}/></div>
          ))}
          <div><div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Categoria</div>
          <select style={inp} value={form.category_id||''} onChange={e=>set('category_id',e.target.value)}>
            <option value="">Selecionar...</option>
            {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        </div>
        <Btn full color={P.primary} onClick={submitRecurring} style={{ marginTop:14 }}>Salvar recorrente</Btn>
      </Modal>
    </div>
  )
}
