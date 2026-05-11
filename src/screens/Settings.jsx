import { useState, useEffect, useRef } from 'react'
import { P, uid, CAT_COLORS } from '../lib/helpers.js'
import { getSettings, saveSettings, requestMicPermission } from '../lib/settings.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import Icon from '../components/Icon.jsx'

const Toggle = ({ value, onChange, disabled }) => (
  <div onClick={()=>!disabled&&onChange(!value)}
    style={{ width:44,height:26,borderRadius:13,background:value?P.primary:P.border,cursor:disabled?'not-allowed':'pointer',position:'relative',transition:'background .2s',flexShrink:0,opacity:disabled?.5:1 }}>
    <div style={{ position:'absolute',top:3,left:value?20:3,width:20,height:20,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,.2)',transition:'left .2s' }}/>
  </div>
)

const Section = ({title,icon,children}) => {
  const [open,setOpen]=useState(true)
  return (
    <div style={{ background:P.card,border:`1px solid ${P.border}`,borderRadius:14,marginBottom:10,overflow:'hidden' }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ display:'flex',alignItems:'center',gap:10,padding:'14px 18px',cursor:'pointer',borderBottom:open?`1px solid ${P.border}`:'none' }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ flex:1,fontSize:14,fontWeight:600,color:P.text }}>{title}</span>
        <span style={{ fontSize:18,color:P.muted }}>{open?'∧':'∨'}</span>
      </div>
      {open && <div style={{ padding:'14px 18px' }}>{children}</div>}
    </div>
  )
}

const Row = ({label,desc,children}) => (
  <div style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${P.border}` }}>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:13,fontWeight:500,color:P.text }}>{label}</div>
      {desc&&<div style={{ fontSize:11,color:P.muted,marginTop:1 }}>{desc}</div>}
    </div>
    {children}
  </div>
)

export default function Settings({ appData, setData }) {
  const { user } = useAuth()
  const [cfg, setCfg] = useState(getSettings())
  const [micStatus, setMicStatus] = useState(cfg.micPermission)
  const [pwaInstallable, setPwaInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showPWAGuide, setShowPWAGuide] = useState(false)
  const deferredPrompt = useRef(null)
  const { categories=[], costCenters=[] } = appData
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState('expense')

  useEffect(() => {
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent))
    setIsAndroid(/Android/i.test(navigator.userAgent))
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault(); deferredPrompt.current=e; setPwaInstallable(true)
    })
  }, [])

  const set = (k,v) => { const next=saveSettings({[k]:v}); setCfg(next) }

  const handleMicPermission = async () => {
    const status = await requestMicPermission()
    setMicStatus(status); setCfg(getSettings())
  }

  const handleInstallPWA = async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome==='accepted') deferredPrompt.current=null
    } else {
      setShowPWAGuide(true)
    }
  }

  const addCat = () => {
    if (!newCatName.trim()) return
    const nc = { id:uid(), name:newCatName.trim(), color:CAT_COLORS[categories.length%CAT_COLORS.length], type:newCatType, cost_center_id:'personal', subs:[] }
    setData(d=>({...d,categories:[...d.categories,nc]}))
    setNewCatName('')
  }

  const micColors = { granted:'#16a34a', denied:'#dc2626', prompt:'#f59e0b', unavailable:'#9ca3af' }
  const micLabels = { granted:'✅ Liberado', denied:'❌ Negado', prompt:'⏳ Pendente', unavailable:'🚫 Indisponível' }
  const inp = { padding:'9px 12px',borderRadius:9,border:`1px solid ${P.border}`,background:P.light,fontSize:12,color:P.text,outline:'none',appearance:'none' }

  return (
    <div className="fade-in" style={{ padding:'24px 20px',maxWidth:700 }}>
      <h1 style={{ fontSize:22,fontWeight:700,color:P.text,marginBottom:4 }}>Configurações</h1>
      <p style={{ fontSize:13,color:P.muted,marginBottom:20 }}>Personalize sua experiência</p>

      {/* Conta */}
      <Section title="Conta" icon="👤">
        <div style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',marginBottom:10,borderBottom:`1px solid ${P.border}` }}>
          <div style={{ width:52,height:52,borderRadius:'50%',background:P.primaryL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0 }}>
            {user?.avatar||'👤'}
          </div>
          <div>
            <div style={{ fontSize:14,fontWeight:600,color:P.text }}>{user?.name}</div>
            <div style={{ fontSize:12,color:P.muted }}>{user?.email}</div>
            <div style={{ fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:5,background:'#eef0ff',color:P.primary,display:'inline-block',marginTop:3 }}>
              {user?.role==='admin'?'👑 Admin':user?.role==='viewer'?'👁 Visualizador':'👤 Usuário'}
            </div>
          </div>
        </div>
        <div style={{ fontSize:11,color:P.muted,background:P.light,borderRadius:8,padding:'8px 12px' }}>
          Para editar nome, foto e senha acesse o <b>perfil</b> tocando no avatar no canto superior direito.
        </div>
      </Section>

      {/* Assistente de voz */}
      <Section title="Assistente de voz" icon="🎙️">
        <Row label="Microfone" desc={`Status: ${micLabels[micStatus]||micStatus}`}>
          <button onClick={handleMicPermission}
            style={{ padding:'7px 14px',background:micStatus==='granted'?P.light:P.primary,color:micStatus==='granted'?P.muted:'#fff',border:`1px solid ${micStatus==='granted'?P.border:'transparent'}`,borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap' }}>
            {micStatus==='granted'?'Verificar':'Liberar microfone'}
          </button>
        </Row>
        <Row label="Agitar para usar voz" desc="Sacuda o celular para abrir o gravador instantaneamente">
          <Toggle value={cfg.shakeEnabled} onChange={v=>set('shakeEnabled',v)}/>
        </Row>
        <Row label="Confirmação automática" desc={`Confirmar lançamento automaticamente após ${cfg.autoConfirmDelay}s`}>
          <Toggle value={cfg.autoConfirmVoice} onChange={v=>set('autoConfirmVoice',v)}/>
        </Row>
        <div style={{ paddingTop:10 }}>
          <div style={{ fontSize:11,color:P.muted,marginBottom:6 }}>Tempo para auto-confirmar (segundos)</div>
          <div style={{ display:'flex',gap:6 }}>
            {[3,5,10].map(v=>(
              <button key={v} onClick={()=>set('autoConfirmDelay',v)}
                style={{ flex:1,padding:'7px',border:`1px solid ${cfg.autoConfirmDelay===v?P.primary:P.border}`,borderRadius:8,background:cfg.autoConfirmDelay===v?P.primaryL:'transparent',color:cfg.autoConfirmDelay===v?P.primary:P.muted,fontSize:12,fontWeight:cfg.autoConfirmDelay===v?600:400,cursor:'pointer' }}>
                {v}s
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Instalar app */}
      <Section title="Instalar app no celular" icon="📱">
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:12,color:P.muted,marginBottom:12,lineHeight:1.6 }}>
            Instale o FinanceOS na tela inicial do seu celular para usar como um app nativo — sem precisar abrir o navegador.
          </div>
          {pwaInstallable ? (
            <button onClick={handleInstallPWA}
              style={{ width:'100%',padding:12,background:P.primary,color:'#fff',border:'none',borderRadius:11,fontSize:13,fontWeight:700,cursor:'pointer' }}>
              📲 Instalar FinanceOS agora
            </button>
          ) : (
            <button onClick={()=>setShowPWAGuide(v=>!v)}
              style={{ width:'100%',padding:12,background:P.light,color:P.primary,border:`1px solid ${P.primary}`,borderRadius:11,fontSize:13,fontWeight:600,cursor:'pointer' }}>
              📖 Ver instruções de instalação
            </button>
          )}
        </div>
        {showPWAGuide && (
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            <div style={{ background:'#f0fdf4',borderRadius:10,padding:'10px 12px' }}>
              <div style={{ fontSize:12,fontWeight:600,color:'#16a34a',marginBottom:6 }}>🤖 Android (Chrome)</div>
              <div style={{ fontSize:11,color:P.muted,lineHeight:1.7 }}>
                1. Abra o site no Chrome<br/>
                2. Toque nos <b>3 pontinhos</b> (⋮) no canto superior<br/>
                3. Toque em <b>"Adicionar à tela inicial"</b><br/>
                4. Confirme tocando em <b>Adicionar</b>
              </div>
            </div>
            <div style={{ background:'#f0f4ff',borderRadius:10,padding:'10px 12px' }}>
              <div style={{ fontSize:12,fontWeight:600,color:'#2563eb',marginBottom:6 }}>🍎 iPhone / iPad (Safari)</div>
              <div style={{ fontSize:11,color:P.muted,lineHeight:1.7 }}>
                1. Abra o site no <b>Safari</b> (não Chrome)<br/>
                2. Toque no ícone de <b>compartilhar</b> (□↑) embaixo<br/>
                3. Role e toque em <b>"Adicionar à Tela de Início"</b><br/>
                4. Toque em <b>Adicionar</b> no canto superior
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Categorias */}
      <Section title="Categorias" icon="🏷️">
        <div style={{ display:'flex',gap:6,marginBottom:12 }}>
          {[['expense','Despesa','#dc2626'],['income','Receita','#16a34a'],['investment','Invest.','#2563eb']].map(([v,l,c])=>(
            <button key={v} onClick={()=>setNewCatType(v)}
              style={{ flex:1,padding:'7px',border:`1px solid ${newCatType===v?c:P.border}`,borderRadius:8,background:newCatType===v?c+'15':'transparent',color:newCatType===v?c:P.muted,fontSize:11,fontWeight:newCatType===v?600:400,cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display:'flex',gap:8,marginBottom:14 }}>
          <input style={{ ...inp,flex:1 }} placeholder="Nome da nova categoria" value={newCatName} onChange={e=>setNewCatName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCat()}/>
          <button onClick={addCat} style={{ padding:'9px 16px',background:P.primary,color:'#fff',border:'none',borderRadius:9,fontSize:12,fontWeight:600,cursor:'pointer' }}>
            + Adicionar
          </button>
        </div>
        <div style={{ maxHeight:200,overflowY:'auto' }}>
          {categories.filter(c=>c.type===newCatType).map(c=>(
            <div key={c.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:`1px solid ${P.border}` }}>
              <div style={{ width:10,height:10,borderRadius:'50%',background:c.color,flexShrink:0 }}/>
              <span style={{ flex:1,fontSize:12,color:P.text }}>{c.name}</span>
              <span style={{ fontSize:10,color:P.muted }}>{c.subs?.length||0} sub</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Sobre */}
      <Section title="Sobre o app" icon="ℹ️">
        <div style={{ display:'grid',gap:8 }}>
          {[['Versão','1.0.0'],['Plataforma','PWA'],['Dados','Salvos localmente'],['IA','Parser offline + Anthropic (online)']].map(([k,v])=>(
            <div key={k} style={{ display:'flex',justifyContent:'space-between',fontSize:12,padding:'6px 0',borderBottom:`1px solid ${P.border}` }}>
              <span style={{ color:P.muted }}>{k}</span><span style={{ color:P.text,fontWeight:500 }}>{v}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
