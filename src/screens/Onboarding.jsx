import { useState } from 'react'
import { P, uid } from '../lib/helpers.js'

const STEPS = ['boas-vindas', 'cartao', 'meta', 'pronto']

export default function Onboarding({ user, onComplete, onAddCard, onAddGoal }) {
  const [step, setStep]   = useState(0)
  const [card, setCard]   = useState({ name:'', last_four:'', color:P.primary, closing_day:15, due_day:22, limit_amount:'' })
  const [goal, setGoal]   = useState({ name:'', target:'', icon:'🎯' })
  const [saving, setSaving] = useState(false)

  const CARD_COLORS = [P.primary,'#162447','#1A3050','#243B55','#0C1835',P.gold,'#C4A35A','#B8960C']
  const GOAL_ICONS  = ['🎯','✈️','🚗','🏠','📱','🎓','🛡️','💍']

  const inp = { width:'100%', padding:'11px 13px', borderRadius:11, border:`1.5px solid #eeefee`, background:'#f8f9fb', color:P.text, fontSize:13, outline:'none', appearance:'none' }

  const next = () => setStep(s => Math.min(s+1, STEPS.length-1))

  const saveCard = async () => {
    if (card.name && card.last_four) {
      setSaving(true)
      await onAddCard({ ...card, limit_amount:Number(card.limit_amount)||5000, closing_day:Number(card.closing_day), due_day:Number(card.due_day) })
      setSaving(false)
    }
    next()
  }

  const saveGoal = async () => {
    if (goal.name && goal.target) {
      setSaving(true)
      await onAddGoal({ ...goal, target:Number(goal.target), current:0, color:P.gold, cost_center_id:'personal' })
      setSaving(false)
    }
    next()
  }

  const firstName = user?.name?.split(' ')[0]||'você'

  const GoldLine = () => <div style={{ height:2, background:`linear-gradient(90deg,${P.primary},${P.gold},${P.primary})`, borderRadius:1, marginBottom:20, opacity:.7 }}/>

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fb', padding:'20px 16px' }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:24 }}>
          {STEPS.map((_,i) => (
            <div key={i} style={{ width:i===step?28:8, height:8, borderRadius:4, background:i<=step?P.gold:'#eeefee', transition:'all .3s' }}/>
          ))}
        </div>

        {/* Step 0 */}
        {step===0 && (
          <div className="fade-in" style={{ background:'#fff', borderRadius:22, border:'1px solid #eeefee', padding:'28px 24px', textAlign:'center', boxShadow:`0 4px 24px ${P.primary}10` }}>
            <GoldLine/>
            <div style={{ fontSize:52, marginBottom:12 }}>👋</div>
            <div style={{ fontSize:22, fontWeight:800, color:P.primary, marginBottom:8 }}>Olá, {firstName}!</div>
            <div style={{ fontSize:14, color:P.muted, lineHeight:1.6, marginBottom:22 }}>
              Bem-vindo ao <b style={{ color:P.primary }}>Finance<span style={{ color:P.gold }}>OS</span></b>.<br/>
              Configure em <b>2 passos opcionais</b> ou vá direto para o app.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
              {[['🎙️','Voz com IA','Fale um comando e a IA lança automaticamente'],['📳','Agitar','Sacuda o celular para abrir o gravador'],['🔔','Notificação','Confirme ou refaça antes de salvar']].map(([icon,title,desc]) => (
                <div key={title} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#f8f9fb', borderRadius:10, textAlign:'left', border:`1px solid #eeefee` }}>
                  <span style={{ fontSize:20 }}>{icon}</span>
                  <div><div style={{ fontSize:12, fontWeight:600, color:P.primary }}>{title}</div><div style={{ fontSize:11, color:P.muted }}>{desc}</div></div>
                </div>
              ))}
            </div>
            <button onClick={next} style={{ width:'100%', padding:14, background:`linear-gradient(135deg,${P.primary},#1A2C5E)`, color:'#fff', border:'none', borderRadius:13, fontSize:14, fontWeight:700, cursor:'pointer', position:'relative', overflow:'hidden', boxShadow:`0 4px 16px ${P.primary}40` }}>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${P.gold},transparent)` }}/>
              Configurar agora →
            </button>
            <button onClick={onComplete} style={{ width:'100%', padding:10, background:'transparent', border:'none', color:P.muted, fontSize:12, cursor:'pointer', marginTop:8 }}>
              Pular e ir para o app
            </button>
          </div>
        )}

        {/* Step 1 - Cartão */}
        {step===1 && (
          <div className="fade-in" style={{ background:'#fff', borderRadius:22, border:'1px solid #eeefee', padding:'24px 22px', boxShadow:`0 4px 24px ${P.primary}10` }}>
            <GoldLine/>
            <div style={{ fontSize:28, textAlign:'center', marginBottom:8 }}>💳</div>
            <div style={{ fontSize:18, fontWeight:700, color:P.primary, textAlign:'center', marginBottom:4 }}>Adicionar cartão de crédito</div>
            <div style={{ fontSize:12, color:P.muted, textAlign:'center', marginBottom:18 }}>Opcional — adicione depois se preferir</div>

            <div style={{ background:card.color, borderRadius:14, padding:'16px 18px', marginBottom:16, color:'#fff' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{card.name||'Nome do cartão'}</div>
              <div style={{ fontSize:12, opacity:.7, marginTop:3 }}>•••• •••• •••• {card.last_four||'0000'}</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, fontSize:11, opacity:.8 }}>
                <span>Fecha dia {card.closing_day}</span><span>Vence dia {card.due_day}</span>
              </div>
            </div>

            <div style={{ display:'grid', gap:10 }}>
              <div><div style={{ fontSize:11,color:P.muted,marginBottom:3 }}>Nome do cartão</div><input style={inp} placeholder="Ex: Nubank, Itaú..." value={card.name} onChange={e=>setCard(c=>({...c,name:e.target.value}))}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><div style={{ fontSize:11,color:P.muted,marginBottom:3 }}>Últimos 4 dígitos</div><input style={inp} placeholder="0000" maxLength={4} value={card.last_four} onChange={e=>setCard(c=>({...c,last_four:e.target.value.replace(/\D/g,'')}))}/></div>
                <div><div style={{ fontSize:11,color:P.muted,marginBottom:3 }}>Limite (R$)</div><input style={inp} type="number" placeholder="5000" value={card.limit_amount} onChange={e=>setCard(c=>({...c,limit_amount:e.target.value}))}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><div style={{ fontSize:11,color:P.muted,marginBottom:3 }}>Dia fechamento</div><input style={inp} type="number" min={1} max={31} value={card.closing_day} onChange={e=>setCard(c=>({...c,closing_day:e.target.value}))}/></div>
                <div><div style={{ fontSize:11,color:P.muted,marginBottom:3 }}>Dia vencimento</div><input style={inp} type="number" min={1} max={31} value={card.due_day} onChange={e=>setCard(c=>({...c,due_day:e.target.value}))}/></div>
              </div>
              <div>
                <div style={{ fontSize:11,color:P.muted,marginBottom:6 }}>Cor do cartão</div>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                  {CARD_COLORS.map(c=>(
                    <button key={c} onClick={()=>setCard(cd=>({...cd,color:c}))} style={{ width:30,height:30,borderRadius:'50%',background:c,border:card.color===c?`3px solid ${P.gold}`:'2px solid transparent',cursor:'pointer' }}/>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={next} style={{ flex:1,padding:12,border:'1px solid #eeefee',borderRadius:12,background:'transparent',color:P.muted,fontSize:13,cursor:'pointer' }}>Pular</button>
              <button onClick={saveCard} disabled={saving} style={{ flex:2,padding:12,background:`linear-gradient(135deg,${P.primary},#1A2C5E)`,color:'#fff',border:'none',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer' }}>
                {saving?'Salvando...':card.name&&card.last_four?'Adicionar →':'Pular →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Meta */}
        {step===2 && (
          <div className="fade-in" style={{ background:'#fff', borderRadius:22, border:'1px solid #eeefee', padding:'24px 22px', boxShadow:`0 4px 24px ${P.primary}10` }}>
            <GoldLine/>
            <div style={{ fontSize:28,textAlign:'center',marginBottom:8 }}>🎯</div>
            <div style={{ fontSize:18,fontWeight:700,color:P.primary,textAlign:'center',marginBottom:4 }}>Primeira meta financeira</div>
            <div style={{ fontSize:12,color:P.muted,textAlign:'center',marginBottom:18 }}>Opcional — o app acompanha seu progresso</div>
            <div style={{ display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:14 }}>
              {GOAL_ICONS.map(ic=>(
                <button key={ic} onClick={()=>setGoal(g=>({...g,icon:ic}))} style={{ width:42,height:42,borderRadius:11,border:`1.5px solid ${goal.icon===ic?P.gold:'#eeefee'}`,background:goal.icon===ic?P.goldL:'transparent',fontSize:22,cursor:'pointer' }}>{ic}</button>
              ))}
            </div>
            <div style={{ display:'grid',gap:10 }}>
              <div><div style={{ fontSize:11,color:P.muted,marginBottom:3 }}>Nome da meta</div><input style={inp} placeholder="Ex: Viagem, Reserva..." value={goal.name} onChange={e=>setGoal(g=>({...g,name:e.target.value}))}/></div>
              <div><div style={{ fontSize:11,color:P.muted,marginBottom:3 }}>Valor objetivo (R$)</div><input style={inp} type="number" placeholder="10000" value={goal.target} onChange={e=>setGoal(g=>({...g,target:e.target.value}))}/></div>
            </div>
            <div style={{ display:'flex',gap:8,marginTop:16 }}>
              <button onClick={next} style={{ flex:1,padding:12,border:'1px solid #eeefee',borderRadius:12,background:'transparent',color:P.muted,fontSize:13,cursor:'pointer' }}>Pular</button>
              <button onClick={saveGoal} disabled={saving} style={{ flex:2,padding:12,background:`linear-gradient(135deg,${P.primary},#1A2C5E)`,color:'#fff',border:'none',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer' }}>
                {saving?'Salvando...':goal.name&&goal.target?'Criar meta →':'Pular →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Pronto */}
        {step===3 && (
          <div className="fade-in" style={{ background:'#fff', borderRadius:22, border:'1px solid #eeefee', padding:'28px 24px', textAlign:'center', boxShadow:`0 4px 24px ${P.primary}10` }}>
            <GoldLine/>
            <div style={{ fontSize:52,marginBottom:12 }}>🚀</div>
            <div style={{ fontSize:22,fontWeight:800,color:P.primary,marginBottom:8 }}>Tudo pronto, {firstName}!</div>
            <div style={{ fontSize:13,color:P.muted,lineHeight:1.6,marginBottom:20 }}>
              Comece falando um <b style={{ color:P.primary }}>comando de voz</b> ou toque em <b>+</b> para adicionar seu primeiro lançamento.
            </div>
            <div style={{ background:P.primaryL, borderRadius:12, padding:'12px 14px', marginBottom:20, textAlign:'left', border:`1px solid ${P.primary}15` }}>
              <div style={{ fontSize:12,fontWeight:600,color:P.primary,marginBottom:6 }}><span style={{ color:P.gold }}>✦</span> Tente falar:</div>
              <div style={{ fontSize:12,color:P.muted,lineHeight:1.9 }}>
                🎙️ <i>"R$50 no almoço"</i><br/>
                🎙️ <i>"Paguei R$1.800 de aluguel"</i><br/>
                🎙️ <i>"Recebi R$5.000 de salário"</i>
              </div>
            </div>
            <button onClick={onComplete} style={{ width:'100%',padding:14,background:`linear-gradient(135deg,${P.primary},#1A2C5E)`,color:'#fff',border:'none',borderRadius:13,fontSize:14,fontWeight:700,cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:`0 4px 16px ${P.primary}40` }}>
              <div style={{ position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${P.gold},transparent)` }}/>
              Ir para o app →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
