import { useAuth } from '../contexts/AuthContext.jsx'
import Icon from './Icon.jsx'
import { P } from '../lib/helpers.js'

const NAV = [
  { id:'dashboard',    label:'Dashboard',           icon:'home'    },
  { id:'transactions', label:'Transações',          icon:'list'    },
  { id:'installments', label:'Parcelas/Recorrentes',icon:'repeat'  },
  { id:'goals',        label:'Meus Objetivos',      icon:'target'  },
  { id:'cards',        label:'Cartões',             icon:'card'    },
  { id:'categories',   label:'Categorias',          icon:'folder'  },
  { id:'settings',     label:'Configurações',       icon:'settings'},
]

const RepeatIcon = ({color}) => (
  <svg width="21" height="21" viewBox="0 0 24 24" style={{display:'block',flexShrink:0}}>
    <path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const SettingsIcon = ({color}) => (
  <svg width="21" height="21" viewBox="0 0 24 24" style={{display:'block',flexShrink:0}}>
    <circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke={color} strokeWidth="1.5"/>
  </svg>
)

export default function Sidebar({ screen, setScreen, onExportPDF }) {
  const { user, signOut } = useAuth()

  const renderIcon = (item, active) => {
    const color = active ? P.gold : 'rgba(255,255,255,0.45)'
    if (item.id==='installments') return <RepeatIcon color={color}/>
    if (item.id==='settings')     return <SettingsIcon color={color}/>
    return <Icon n={item.icon} size={21} color={color}/>
  }

  return (
    <div style={{ width:220, background:P.primary, borderRight:'none', display:'flex', flexDirection:'column', height:'100vh', flexShrink:0, position:'fixed', left:0, top:0, zIndex:50, boxShadow:`4px 0 20px ${P.primary}30` }}>

      {/* Logo */}
      <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:P.gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>💰</div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#fff', letterSpacing:-.3 }}>
              Finance<span style={{ color:P.gold }}>OS</span>
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)' }}>Meu Orçamento</div>
          </div>
        </div>
        {/* Gold accent line */}
        <div style={{ height:1, background:`linear-gradient(90deg,${P.gold},transparent)`, marginTop:16, opacity:.6 }}/>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
        {NAV.map(item => {
          const active = screen===item.id
          return (
            <button key={item.id} onClick={()=>setScreen(item.id)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 18px', border:'none', background:active?'rgba(201,165,90,0.12)':'transparent', color:active?P.gold:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:active?600:400, cursor:'pointer', textAlign:'left', borderLeft:`3px solid ${active?P.gold:'transparent'}`, transition:'all .15s' }}>
              {renderIcon(item, active)}
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* PDF button */}
      <div style={{ padding:'10px 14px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onExportPDF}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', background:P.gold, color:P.primary, border:'none', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer' }}>
          <Icon n="file" size={15} color={P.primary}/> Exportar PDF
        </button>
      </div>

      {/* User */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:P.goldM, border:`1.5px solid ${P.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0, overflow:'hidden' }}>
          {user?.photo ? <img src={user.photo} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt=""/> : user?.avatar||'👤'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
        </div>
        <button onClick={signOut} style={{ background:'transparent', border:'none', cursor:'pointer', padding:4 }} title="Sair">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
