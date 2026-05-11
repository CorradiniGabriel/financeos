import { useState } from 'react'
import { fmt, fmtShort, fmtDate, P } from '../lib/helpers.js'
import { Badge } from '../components/ui.jsx'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Dashboard({ appData, user, onVoice, onAdd, setScreen, period, setPeriod }) {
  const { transactions=[], categories=[], costCenters=[], creditCards=[], goals=[], budgets=[] } = appData
  const [showGoals, setShowGoals] = useState(true)

  const periodTx = transactions.filter(t => t.date?.startsWith(period))
  const income  = periodTx.filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount),0)
  const expense = periodTx.filter(t=>t.type==='expense').reduce((a,t)=>a+Number(t.amount),0)
  const invest  = periodTx.filter(t=>t.type==='investment').reduce((a,t)=>a+Number(t.amount),0)
  const balance = income - expense - invest

  const getCat = id => categories.find(c=>c.id===id)

  // Orçado x Realizado
  const totalBudget = budgets.filter(b=>b.period===period).reduce((a,b)=>a+Number(b.limit),0)
  const budgetPct = totalBudget>0 ? Math.round((expense/totalBudget)*100) : 0
  const [y,m] = period.split('-')
  const daysInMonth = new Date(y,m,0).getDate()
  const dayOfMonth = new Date().getDate()
  const expectedPct = Math.round((dayOfMonth/daysInMonth)*100)

  // Categorias com orçamento
  const catBudgets = budgets.filter(b=>b.period===period).map(b => {
    const cat = getCat(b.category_id)
    const spent = periodTx.filter(t=>t.type==='expense'&&t.category_id===b.category_id).reduce((a,t)=>a+Number(t.amount),0)
    const pct = Number(b.limit)>0 ? Math.round((spent/Number(b.limit))*100) : 0
    return { ...b, cat, spent, pct }
  }).filter(b=>b.cat)

  const recent = [...periodTx].sort((a,b)=>b.date?.localeCompare(a.date)).slice(0,5)

  const prevMonth = new Date(y,m-2).toISOString().slice(0,7)
  const prevIncome = transactions.filter(t=>t.date?.startsWith(prevMonth)&&t.type==='income').reduce((a,t)=>a+Number(t.amount),0)
  const prevExpense = transactions.filter(t=>t.date?.startsWith(prevMonth)&&t.type==='expense').reduce((a,t)=>a+Number(t.amount),0)
  const incomeDiff = prevIncome>0 ? ((income-prevIncome)/prevIncome*100).toFixed(0) : null
  const expenseDiff = prevExpense>0 ? ((expense-prevExpense)/prevExpense*100).toFixed(0) : null

  const MonthPicker = () => {
    const [y2,m2] = period.split('-')
    const change = delta => {
      const d = new Date(Number(y2), Number(m2)-1+delta)
      setPeriod(d.toISOString().slice(0,7))
    }
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={()=>change(-1)} style={{ background:'transparent', border:`1px solid ${P.border}`, borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:14, color:P.muted }}>‹</button>
        <div style={{ fontSize:13, fontWeight:600, color:P.text, minWidth:120, textAlign:'center' }}>
          {MONTHS[Number(m2)-1]} {y2}
        </div>
        <button onClick={()=>change(1)} style={{ background:'transparent', border:`1px solid ${P.border}`, borderRadius:8, width:30, height:30, cursor:'pointer', fontSize:14, color:P.muted }}>›</button>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ padding:'24px 28px', maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:P.text }}>Dashboard</h1>
          <div style={{ fontSize:13, color:P.muted, marginTop:2 }}>Visão geral do mês</div>
        </div>
        <MonthPicker/>
      </div>

      {/* Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { label:'Receita',     color:'#16a34a', bg:'#f0fdf4', emoji:'⊕', type:'income' },
          { label:'Despesa',     color:'#dc2626', bg:'#fef2f2', emoji:'⊖', type:'expense' },
          { label:'Investimento',color:'#2563eb', bg:'#eff6ff', emoji:'📈', type:'investment' },
          { label:'Voz (IA)',    color:P.gold, bg:P.primaryL, emoji:'🎤', type:'voice' },
        ].map(a => (
          <button key={a.label} onClick={() => a.type==='voice' ? onVoice() : onAdd(a.type)}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px', background:a.bg, border:`1px solid ${a.color}25`, borderRadius:12, color:a.color, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <span style={{ fontSize:16 }}>{a.emoji}</span> {a.label}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { label:'Saldo total', value:balance, color: balance>=0?'#16a34a':'#dc2626', diff: null },
          { label:'Entradas do mês', value:income, color:'#16a34a', diff:incomeDiff },
          { label:'Saídas do mês',   value:expense, color:'#dc2626', diff:expenseDiff },
          { label:'Investimentos',    value:invest,  color:'#2563eb', diff: null },
        ].map(m => (
          <div key={m.label} style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontSize:11, color:P.muted, marginBottom:6, display:'flex', alignItems:'center', gap:4 }}>
              {m.label}
              {m.diff !== null && <span style={{ fontSize:10, fontWeight:600, color:Number(m.diff)>=0?'#16a34a':'#dc2626', background:Number(m.diff)>=0?'#f0fdf4':'#fef2f2', padding:'1px 5px', borderRadius:4 }}>
                {Number(m.diff)>=0?'+':''}{m.diff}%
              </span>}
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:m.color }}>{fmt(m.value)}</div>
          </div>
        ))}
      </div>

      {/* Orçado x Realizado */}
      {totalBudget > 0 && (
        <div style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:14, padding:'18px 20px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:P.text }}>Orçado x Realizado</div>
              <div style={{ fontSize:11, color:P.muted }}>Acompanhamento do mês corrente</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:18, fontWeight:700, color: budgetPct>100?'#dc2626':budgetPct>expectedPct?'#f59e0b':'#16a34a' }}>{budgetPct}%</div>
              <div style={{ fontSize:11, color:P.muted }}>{fmt(expense)} / {fmt(totalBudget)}</div>
            </div>
          </div>
          <div style={{ height:10, background:P.border, borderRadius:5, overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', width:`${Math.min(budgetPct,100)}%`, background: budgetPct>100?'#dc2626':budgetPct>expectedPct?'#f59e0b':'#16a34a', borderRadius:5 }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:P.muted }}>
            <span>{budgetPct}% gasto</span>
            <span>Esperado p/ hoje: {expectedPct}%</span>
          </div>
        </div>
      )}

      {/* Metas por categoria */}
      {catBudgets.length > 0 && (
        <div style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:14, padding:'16px 20px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, cursor:'pointer' }} onClick={()=>setShowGoals(v=>!v)}>
            <div style={{ fontSize:14, fontWeight:600, color:P.text }}>Metas por categoria</div>
            <span style={{ fontSize:18, color:P.muted }}>{showGoals?'∧':'∨'}</span>
          </div>
          {showGoals && catBudgets.map(b => (
            <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:`1px solid ${P.border}` }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:b.cat.color, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ color:P.text }}>{b.cat.name}</span>
                  <span style={{ color:P.muted }}>{fmt(b.spent)} / {fmt(b.limit)}</span>
                </div>
                <div style={{ height:5, background:P.border, borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(b.pct,100)}%`, background: b.pct>100?'#dc2626':b.pct>80?'#f59e0b':b.cat.color, borderRadius:3 }}/>
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:600, color: b.pct>100?'#dc2626':b.pct>80?'#f59e0b':'#16a34a', minWidth:35, textAlign:'right' }}>{b.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Lançamentos recentes */}
      <div style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:14, padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:14, fontWeight:600, color:P.text }}>Lançamentos recentes</div>
          <button onClick={()=>setScreen('transactions')} style={{ fontSize:12, color:P.primary, background:'transparent', border:'none', cursor:'pointer' }}>ver todos</button>
        </div>
        {recent.length===0 ? (
          <div style={{ textAlign:'center', padding:'20px 0', color:P.muted, fontSize:13 }}>Nenhum lançamento no período.</div>
        ) : recent.map(t => {
          const cat = getCat(t.category_id)
          const card = t.card_id ? creditCards.find(c=>c.id===t.card_id) : null
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${P.border}` }}>
              <div style={{ width:34, height:34, borderRadius:9, background:(cat?.color||'#ccc')+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {t.type==='income'?'💰':t.type==='investment'?'📈':cat?.name?.[0]||'💳'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, color:P.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.description}</div>
                <div style={{ display:'flex', gap:4, marginTop:2 }}>
                  {cat && <Badge label={cat.name} color={cat.color} bg={cat.color+'18'}/>}
                  {card && <Badge label={card.name} color="#6d28d9" bg="#f5f3ff"/>}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color: t.type==='income'?'#16a34a':t.type==='investment'?'#2563eb':'#dc2626' }}>
                  {t.type==='income'?'+':t.type==='investment'?'📈 ':'−'}{fmt(t.amount)}
                </div>
                <div style={{ fontSize:10, color:P.muted }}>{fmtDate(t.date)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
