import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { auth, PERMISSIONS } from '../lib/auth.js'
import { Btn } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import { P } from '../lib/helpers.js'

export default function Profile({ onBack }) {
  const { user, updateProfile, changePassword, signOut, can } = useAuth()
  const [tab, setTab]     = useState('perfil')
  const [name, setName]   = useState(user?.name||'')
  const [photo, setPhoto] = useState(user?.photo||null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]     = useState({text:'',type:''})
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [users, setUsers] = useState([])
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const perm = PERMISSIONS[user?.role]||{}

  const showMsg = (text,type='ok') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3000) }

  const handlePhoto = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => { setPhoto(e.target.result); updateProfile({photo:e.target.result}) }
    reader.readAsDataURL(file)
  }

  const saveProfile = async () => {
    setSaving(true)
    const result = await updateProfile({name, photo})
    setSaving(false)
    result.error ? showMsg(result.error,'err') : showMsg('Perfil atualizado!')
  }

  const savePwd = async () => {
    if (newPass!==confPass) { showMsg('Senhas não coincidem.','err'); return }
    setSaving(true)
    const result = await changePassword(curPass,newPass)
    setSaving(false)
    result.error ? showMsg(result.error,'err') : showMsg('Senha alterada!') || (setCurPass(''),setNewPass(''),setConfPass(''))
  }

  const loadUsers = async () => { setUsers(await auth.listUsers()) }

  const inp = { width:'100%',padding:'10px 13px',borderRadius:10,border:`1px solid ${P.border}`,background:P.light,color:P.text,fontSize:13,outline:'none' }
  const Msg = () => !msg.text?null:(
    <div style={{ padding:'8px 12px',borderRadius:8,fontSize:12,fontWeight:500,marginTop:10,background:msg.type==='err'?'#fef2f2':'#f0fdf4',color:msg.type==='err'?'#dc2626':'#16a34a',borderLeft:`3px solid ${msg.type==='err'?P.red:P.green}` }}>
      {msg.text}
    </div>
  )

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ padding:'16px 14px 12px',background:P.card,borderBottom:`1px solid ${P.border}`,display:'flex',alignItems:'center',gap:10 }}>
        <button onClick={onBack} style={{ background:'transparent',border:'none',cursor:'pointer',padding:2,display:'flex' }}>
          <Icon n="chevr" size={20} color={P.muted} style={{ transform:'rotate(180deg)' }}/>
        </button>
        <div style={{ fontSize:16,fontWeight:700,color:P.text }}>Minha conta</div>
      </div>

      {/* Avatar */}
      <div style={{ padding:'20px 18px 14px',background:P.card,borderBottom:`1px solid ${P.border}`,display:'flex',alignItems:'center',gap:16 }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:68,height:68,borderRadius:'50%',background:P.primaryL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,overflow:'hidden',flexShrink:0,border:`2px solid ${P.border}` }}>
            {photo ? <img src={photo} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt="foto"/> : (user?.avatar||'👤')}
          </div>
          <button onClick={()=>fileRef.current?.click()}
            style={{ position:'absolute',bottom:0,right:0,width:24,height:24,borderRadius:'50%',background:P.primary,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
            <Icon n="edit" size={11} color="#fff"/>
          </button>
        </div>
        <div>
          <div style={{ fontSize:17,fontWeight:700,color:P.text }}>{user?.name}</div>
          <div style={{ fontSize:12,color:P.muted }}>{user?.email}</div>
          <span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:5,background:perm.color+'18',color:perm.color,display:'inline-block',marginTop:4 }}>
            {perm.icon} {perm.label}
          </span>
        </div>
      </div>

      {/* Hidden inputs */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handlePhoto(e.target.files[0])}/>
      <input ref={cameraRef} type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={e=>handlePhoto(e.target.files[0])}/>

      {/* Photo buttons */}
      <div style={{ display:'flex',gap:8,padding:'10px 18px',background:P.light,borderBottom:`1px solid ${P.border}` }}>
        <button onClick={()=>cameraRef.current?.click()}
          style={{ flex:1,padding:'8px',border:`1px solid ${P.border}`,borderRadius:9,background:P.card,color:P.text,fontSize:12,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5 }}>
          📷 Tirar foto
        </button>
        <button onClick={()=>fileRef.current?.click()}
          style={{ flex:1,padding:'8px',border:`1px solid ${P.border}`,borderRadius:9,background:P.card,color:P.text,fontSize:12,fontWeight:500,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5 }}>
          🖼️ Da galeria
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',background:P.card,borderBottom:`1px solid ${P.border}` }}>
        {[['perfil','Perfil'],['seguranca','Segurança'],can('canManageUsers')&&['usuarios','Usuários']].filter(Boolean).map(([v,l])=>(
          <button key={v} onClick={()=>{setTab(v);if(v==='usuarios')loadUsers()}}
            style={{ flex:1,padding:'11px 6px',border:'none',background:'transparent',color:tab===v?P.primary:P.muted,fontSize:12,fontWeight:tab===v?700:400,cursor:'pointer',borderBottom:`2px solid ${tab===v?P.primary:'transparent'}` }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ padding:'16px 18px 80px' }}>
        {tab==='perfil' && (
          <div className="fade-in" style={{ display:'grid',gap:12 }}>
            <div><div style={{ fontSize:11,color:P.muted,marginBottom:4 }}>Nome de exibição</div>
            <input style={inp} value={name} onChange={e=>setName(e.target.value)}/></div>
            <div><div style={{ fontSize:11,color:P.muted,marginBottom:4 }}>E-mail</div>
            <input style={{ ...inp,color:P.muted }} value={user?.email} disabled/></div>
            <Msg/>
            <Btn color={P.primary} full onClick={saveProfile} disabled={saving}>{saving?'Salvando...':'Salvar perfil'}</Btn>
            <div style={{ height:1,background:P.border }}/>
            <Btn color={P.red} outline full onClick={signOut}>🚪 Sair da conta</Btn>
          </div>
        )}

        {tab==='seguranca' && (
          <div className="fade-in" style={{ display:'grid',gap:12 }}>
            <div style={{ padding:'10px 13px',background:'#fffbeb',borderRadius:10,fontSize:11,color:'#92400e',borderLeft:'3px solid #f59e0b' }}>
              🔐 Modo offline — senha armazenada localmente no dispositivo.
            </div>
            {[['Senha atual',curPass,setCurPass],['Nova senha',newPass,setNewPass],['Confirmar nova senha',confPass,setConfPass]].map(([l,v,s])=>(
              <div key={l}><div style={{ fontSize:11,color:P.muted,marginBottom:4 }}>{l}</div>
              <input style={inp} type="password" value={v} onChange={e=>s(e.target.value)}/></div>
            ))}
            <Msg/>
            <Btn color={P.primary} full onClick={savePwd} disabled={saving}>{saving?'Alterando...':'Alterar senha'}</Btn>
          </div>
        )}

        {tab==='usuarios' && (
          <div className="fade-in">
            <div style={{ fontSize:11,color:P.muted,marginBottom:12 }}>Gerencie usuários e papéis do sistema.</div>
            {users.map(u=>{
              const up=PERMISSIONS[u.role]||{}
              const isSelf=u.id===user?.id
              return(
                <div key={u.id} style={{ background:P.card,borderRadius:12,border:`1px solid ${P.border}`,padding:'12px 14px',marginBottom:8 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:isSelf?0:8 }}>
                    <div style={{ width:36,height:36,borderRadius:'50%',background:P.primaryL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,overflow:'hidden',flexShrink:0 }}>
                      {u.photo?<img src={u.photo} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt=""/>:u.avatar||'👤'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:P.text }}>{u.name} {isSelf&&<span style={{ fontSize:10,color:P.muted }}>(você)</span>}</div>
                      <div style={{ fontSize:10,color:P.muted }}>{u.email}</div>
                    </div>
                    <span style={{ fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:6,background:up.color+'18',color:up.color }}>{up.icon} {up.label}</span>
                  </div>
                  {!isSelf&&(
                    <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                      {['admin','user','viewer'].map(role=>{
                        const rp=PERMISSIONS[role]
                        return(
                          <button key={role} onClick={()=>auth.setUserRole(u.id,role).then(loadUsers)}
                            style={{ fontSize:10,padding:'4px 10px',borderRadius:8,border:`1px solid ${u.role===role?rp.color:P.border}`,background:u.role===role?rp.color+'18':'transparent',color:u.role===role?rp.color:P.muted,fontWeight:u.role===role?700:400,cursor:'pointer' }}>
                            {rp.icon} {rp.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
