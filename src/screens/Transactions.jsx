import { useState } from 'react'
import { Badge } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { fmt, fmtDate, P } from '../lib/helpers.js'

export default function Transactions({ appData, onDelete, period }) {
  const { transactions=[], categories=[], costCenters=[], creditCards=[] } = appData
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('')
  const [filterCard, setFilterCard] = useState('')
  const [filterMonth, setFilterMonth] = useState(period || '')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  const getCat  = id => categories.find(c=>c.id===id)
  const getCC   = id => costCenters.find(c=>c.id===id)
  const getCard = id => creditCards.find(c=>c.id===id)

  const filtered = [...transactions]
    .filter(t => !search || t.description?.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filterType==='all' || t.type===filterType)
    .filter(t => !filterCat || t.category_id===filterCat)
    .filter(t => !filterCard || t.card_id===filterCard)
    .filter(t => !filterMonth || t.date?.startsWith(filterMonth))
    .filter(t => !filterFrom || t.date >= filterFrom)
    .filter(t => !filterTo   || t.date <= filterTo)
    .sort((a,b)=>b.date?.localeCompare(a.date))

  const totIncome  = filtered.filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount),0)
  const totExpense = filtered.filter(t=>t.type==='expense').reduce((a,t)=>a+Number(t.amount),0)
  const balance    = totIncome - totExpense

  const sel = { padding:'8px 10px', borderRadius:8, border:`1px solid ${P.border}`, background:'#f8f9fb', fontSize:12, color:P.text, outline:'none', appearance:'none', cursor:'pointer' }
  const inp2 = { ...sel, width:'100%' }

  const clearFilters = () => { setSearch(''); setFilterType('all'); setFilterCat(''); setFilterCard(''); setFilterMonth(period||''); setFilterFrom(''); setFilterTo('') }

  return (
    <div className="fade-in" style={{ padding:'24px 28px', maxWidth:900 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:P.text, marginBottom:4 }}>Transações</h1>
      <p style={{ fontSize:13, color:P.muted, marginBottom:16 }}>Histórico completo</p>

      {/* Filter panel */}
      <div style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:14, marginBottom:16, overflow:'hidden' }}>
        <div onClick={()=>setShowFilters(v=>!v)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', cursor:'pointer', borderBottom: showFilters?`1px solid ${P.border}`:'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Icon n="list" size={15} color={P.muted}/>
            <span style={{ fontSize:13, fontWeight:500, color:P.text }}>Filtros</span>
            <span style={{ fontSize:11, background:P.primaryL, color:P.primary, padding:'1px 7px', borderRadius:10, fontWeight:600 }}>
              {[filterType!=='all',filterCat,filterCard,filterMonth&&filterMonth!==period,filterFrom,filterTo,search].filter(Boolean).length}
            </span>
          </div>
          <span style={{ fontSize:18, color:P.muted }}>{showFilters?'∧':'∨'}</span>
        </div>
        {showFilters && (
          <div style={{ padding:'14px 16px' }}>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Buscar por descrição</div>
              <input style={{ ...inp2 }} placeholder="Ex: Supermercado" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
              <div>
                <div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Mês</div>
                <input type="month" style={inp2} value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}/>
              </div>
              <div>
                <div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>De (dia)</div>
                <input type="date" style={inp2} value={filterFrom} onChange={e=>setFilterFrom(e.target.value)}/>
              </div>
              <div>
                <div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Até (dia)</div>
                <input type="date" style={inp2} value={filterTo} onChange={e=>setFilterTo(e.target.value)}/>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Tipo</div>
                <select style={sel} value={filterType} onChange={e=>setFilterType(e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Categoria</div>
                <select style={sel} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                  <option value="">Todas categorias</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11, color:P.muted, marginBottom:3 }}>Cartão</div>
                <select style={sel} value={filterCard} onChange={e=>setFilterCard(e.target.value)}>
                  <option value="">Todos os cartões</option>
                  {creditCards.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={clearFilters} style={{ padding:'7px 16px', border:`1px solid ${P.border}`, borderRadius:8, background:'transparent', color:P.muted, fontSize:12, cursor:'pointer' }}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div style={{ display:'flex', gap:12, marginBottom:16, fontSize:13, color:P.muted }}>
        <span><b style={{ color:P.text }}>{filtered.length}</b> transação(ões)</span>
        <span>Entradas: <b style={{ color:'#16a34a' }}>{fmt(totIncome)}</b></span>
        <span>Saídas: <b style={{ color:'#dc2626' }}>{fmt(totExpense)}</b></span>
        <span>Saldo: <b style={{ color:balance>=0?'#16a34a':'#dc2626' }}>{fmt(balance)}</b></span>
      </div>

      {/* Histórico */}
      <div style={{ background:'#fff', border:`1px solid ${P.border}`, borderRadius:14, overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 16px', borderBottom:`1px solid ${P.border}` }}>
          <Icon n="list" size={14} color={P.muted}/>
          <span style={{ fontSize:13, fontWeight:500, color:P.text }}>Histórico</span>
          <span style={{ fontSize:11, background:P.primaryL, color:P.primary, padding:'1px 7px', borderRadius:10, fontWeight:600 }}>{filtered.length}</span>
        </div>
        {filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:P.muted, fontSize:13 }}>Nenhuma transação encontrada.</div>
        ) : filtered.map(t => {
          const cat  = getCat(t.category_id)
          const cc   = getCC(t.cost_center_id)
          const card = getCard(t.card_id)
          const typeColor = t.type==='income'?'#16a34a':t.type==='investment'?'#2563eb':'#dc2626'
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderBottom:`1px solid ${P.border}` }}>
              <div style={{ width:36, height:36, borderRadius:10, background:(cat?.color||P.muted)+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                {t.type==='income'?'💰':t.type==='investment'?'📈':cat?.name?.[0]||'💳'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, color:P.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.description}</div>
                <div style={{ display:'flex', gap:4, marginTop:3, flexWrap:'wrap' }}>
                  {cat  && <Badge label={cat.name}  color={cat.color}  bg={cat.color +'18'}/>}
                  {cc   && <Badge label={cc.name}   color={cc.color}   bg={cc.color  +'18'}/>}
                  {card && <Badge label={card.name} color="#6d28d9"    bg="#f5f3ff"/>}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:typeColor }}>
                  {t.type==='income'?'+':t.type==='investment'?'':'−'}{fmt(t.amount)}
                </div>
                <div style={{ fontSize:10, color:P.muted, marginTop:2 }}>{fmtDate(t.date)}</div>
                <button onClick={()=>onDelete(t.id)} style={{ marginTop:3, background:'transparent', border:'none', cursor:'pointer', padding:2, display:'block', marginLeft:'auto' }}>
                  <Icon n="trash" size={13} color="#ccc"/>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
