import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { auth as authLib } from '../lib/auth.js'
import { Spinner } from '../components/ui.jsx'
import { P } from '../lib/helpers.js'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]     = useState('signup')
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')

  const submit = async () => {
    if (loading) return
    setError(''); setInfo('')
    if (!email || !password) { setError('Preencha e-mail e senha.'); return }
    if (mode === 'signup' && !name) { setError('Preencha seu nome.'); return }
    setLoading(true)
    const result = mode === 'login' ? await signIn(email, password) : await signUp(name, email, password)
    setLoading(false)
    if (result.error) setError(result.error)
  }

  const handleSocial = async (provider) => {
    const result = provider === 'google' ? await authLib.signInWithGoogle() : await authLib.signInWithGitHub()
    if (result.error) setInfo(result.error)
  }

  const inp = {
    width:'100%', padding:'12px 14px', borderRadius:12,
    border:`1.5px solid #eeefee`, background:'#f8f9fb',
    color:P.text, fontSize:14, outline:'none',
    transition:'border-color .15s',
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fb', padding:'20px 16px', overflowY:'auto' }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:P.primary, display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:12, fontSize:34, boxShadow:`0 4px 20px ${P.primary}40` }}>💰</div>
          <div style={{ fontSize:28, fontWeight:800, color:P.primary, letterSpacing:-.5 }}>
            Finance<span style={{ color:P.gold }}>OS</span>
          </div>
          <div style={{ fontSize:13, color:P.muted, marginTop:4 }}>Sua gestão financeira com IA</div>
          {/* Gold accent line */}
          <div style={{ width:48, height:3, background:`linear-gradient(90deg,${P.primary},${P.gold})`, borderRadius:2, margin:'10px auto 0' }}/>
        </div>

        <div style={{ background:'#fff', borderRadius:22, border:`1px solid #eeefee`, padding:'26px 24px', boxShadow:'0 4px 32px rgba(13,27,62,0.08)' }}>

          {/* Tabs */}
          <div style={{ display:'flex', background:'#f8f9fb', borderRadius:12, padding:3, marginBottom:22 }}>
            {[['signup','Criar conta'],['login','Já tenho conta']].map(([v,l]) => (
              <button key={v} onClick={() => { setMode(v); setError(''); setInfo('') }}
                style={{ flex:1, padding:'9px', borderRadius:9, border:'none', background:mode===v?'#fff':'transparent', color:mode===v?P.primary:P.muted, fontWeight:mode===v?700:400, fontSize:13, cursor:'pointer', boxShadow:mode===v?'0 1px 4px rgba(13,27,62,0.10)':'none', transition:'all .15s' }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display:'grid', gap:12 }}>
            {mode==='signup' && (
              <div>
                <div style={{ fontSize:11, color:P.muted, marginBottom:4 }}>Seu nome</div>
                <input style={inp} placeholder="Como quer ser chamado?" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
              </div>
            )}
            <div>
              <div style={{ fontSize:11, color:P.muted, marginBottom:4 }}>E-mail</div>
              <input style={inp} type="email" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
            </div>
            <div>
              <div style={{ fontSize:11, color:P.muted, marginBottom:4 }}>Senha</div>
              <div style={{ position:'relative' }}>
                <input style={{ ...inp, paddingRight:44 }} type={showPass?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
                <button onClick={()=>setShowPass(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:P.muted, fontSize:15, cursor:'pointer' }}>
                  {showPass?'🙈':'👁'}
                </button>
              </div>
            </div>
          </div>

          {error && <div style={{ marginTop:10, padding:'9px 12px', background:'#fef2f2', borderRadius:9, fontSize:12, color:'#dc2626', borderLeft:'3px solid #ef4444' }}>{error}</div>}
          {info  && <div style={{ marginTop:10, padding:'9px 12px', background:'#fffbeb', borderRadius:9, fontSize:11, color:'#92400e', borderLeft:`3px solid ${P.gold}` }}>{info}</div>}

          {/* CTA com gradiente navy→gold */}
          <button onClick={submit} disabled={loading}
            style={{ marginTop:16, width:'100%', padding:14, background:`linear-gradient(135deg,${P.primary} 0%,#1A2C5E 60%,#2A3B6E 100%)`, color:'#fff', border:'none', borderRadius:13, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading?.7:1, boxShadow:`0 4px 16px ${P.primary}40`, position:'relative', overflow:'hidden' }}>
            {/* Gold shimmer line */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${P.gold},transparent)` }}/>
            {loading ? <><Spinner size={16}/> Processando...</> : mode==='signup' ? '🚀 Começar agora' : 'Entrar'}
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0 12px' }}>
            <div style={{ flex:1, height:1, background:'#eeefee' }}/>
            <span style={{ fontSize:11, color:P.muted }}>ou continue com</span>
            <div style={{ flex:1, height:1, background:'#eeefee' }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[['google','🔵 Google'],['github','⚫ GitHub']].map(([id,label]) => (
              <button key={id} onClick={()=>handleSocial(id)}
                style={{ padding:'10px', border:`1px solid #eeefee`, borderRadius:10, background:'#f8f9fb', color:P.text, fontSize:12, fontWeight:500, cursor:'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          {mode==='signup' && (
            <div style={{ marginTop:14, padding:'11px 13px', background:P.primaryL, borderRadius:11, border:`1px solid ${P.primary}15` }}>
              <div style={{ fontSize:11, color:P.primary, fontWeight:600, marginBottom:4 }}>
                <span style={{ color:P.gold }}>✦</span> O que você vai encontrar
              </div>
              <div style={{ fontSize:11, color:P.muted, lineHeight:1.7 }}>
                Lançamentos por <b style={{ color:P.primary }}>voz com IA</b> · Categorias personalizáveis · Controle de cartões · Metas financeiras · Exportação em PDF
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:14, fontSize:11, color:P.muted }}>
          Seus dados ficam salvos localmente no dispositivo.
        </div>
      </div>
    </div>
  )
}
