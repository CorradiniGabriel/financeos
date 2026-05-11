import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './contexts/AuthContext.jsx'
import { P, today, uid } from './lib/helpers.js'
import { idb, needsSeed, seedCleanData, loadAllData } from './lib/storage.js'
import { CLEAN_SEED } from './lib/demoData.js'
import { exportPDF } from './lib/pdf.js'
import { useShake } from './hooks/useShake.js'
import { getSettings } from './lib/settings.js'
import { showVoiceNotification, requestNotificationPermission } from './lib/nativeNotification.js'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Transactions from './screens/Transactions.jsx'
import Categories from './screens/Categories.jsx'
import Cards from './screens/Cards.jsx'
import Goals from './screens/Goals.jsx'
import Installments from './screens/Installments.jsx'
import Settings from './screens/Settings.jsx'
import Profile from './screens/Profile.jsx'
import Login from './screens/Login.jsx'
import Onboarding from './screens/Onboarding.jsx'
import VoiceModal from './components/VoiceModal.jsx'
import VoiceNotification from './components/VoiceNotification.jsx'
import AddTransactionModal from './components/AddTransactionModal.jsx'
import Icon from './components/Icon.jsx'

const MOBILE_NAV = [
  { id:'dashboard',    label:'Início',   icon:'home'   },
  { id:'transactions', label:'Lançam.',  icon:'list'   },
  { id:'installments', label:'Parcelas', icon:'repeat' },
  { id:'goals',        label:'Metas',    icon:'target' },
  { id:'settings',     label:'Config.',  icon:'settings'},
]

export default function App() {
  const { user, loading: authLoading, can } = useAuth()
  const [screen, setScreen]       = useState('dashboard')
  const [appData, setAppData]     = useState({ costCenters:[], categories:[], creditCards:[], transactions:[], goals:[], installments:[], recurring:[], budgets:[] })
  const [dataReady, setDataReady] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [period, setPeriod]       = useState(new Date().toISOString().slice(0,7))
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [addOpen, setAddOpen]     = useState(false)
  const [prefill, setPrefill]     = useState(null)
  const [notification, setNotification] = useState(null)
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  // Shake → voice
  const onShake = useCallback(() => {
    const cfg = getSettings()
    if (!cfg.shakeEnabled) return
    if (!voiceOpen && !addOpen && !notification) {
      if (navigator.vibrate) navigator.vibrate(60)
      setVoiceOpen(true)
    }
  }, [voiceOpen, addOpen, notification])
  useShake(onShake)

  // PWA shortcuts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('voice') === 'true') { setVoiceOpen(true); window.history.replaceState({}, '', '/') }
    if (params.get('add')   === 'expense') { setPrefill({ type:'expense' }); setAddOpen(true); window.history.replaceState({}, '', '/') }
  }, [])

  // Escuta cliques em notificações nativas via Service Worker
  useEffect(() => {
    if (!navigator.serviceWorker) return
    const handler = e => {
      if (e.data?.type === 'VOICE_CONFIRM') handleNotificationConfirm(e.data.payload)
      if (e.data?.type === 'VOICE_REDO')    handleNotificationRedo(e.data.payload)
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [])

  // Solicita permissão de notificação na primeira vez
  useEffect(() => {
    if (user && dataReady) requestNotificationPermission()
  }, [user, dataReady])
  useEffect(() => {
    if (!user) return
    ;(async () => {
      const shouldSeed = await needsSeed()
      if (shouldSeed) {
        await seedCleanData(CLEAN_SEED)
        setShowOnboarding(true) // novo usuário → mostra onboarding
      }
      const data = await loadAllData()
      setAppData({ ...data, installments:[], recurring:[], budgets:[] })
      setDataReady(true)
    })()
  }, [user])

  // ── CRUD ─────────────────────────────────────────────
  const handleAddTransaction = async (tx) => {
    const newTx = { id:uid(), ...tx }
    await idb.put('transactions', newTx)
    if (tx.card_id) {
      const card = appData.creditCards.find(c=>c.id===tx.card_id)
      if (card) {
        const upd = {...card, current_bill:Number(card.current_bill||0)+Number(tx.amount), status:'open'}
        await idb.put('credit_cards', upd)
        setAppData(d=>({...d, creditCards:d.creditCards.map(c=>c.id===tx.card_id?upd:c)}))
      }
    }
    setAppData(d=>({...d, transactions:[newTx,...d.transactions]}))
  }

  const handleDeleteTransaction = async (id) => {
    await idb.delete('transactions', id)
    setAppData(d=>({...d, transactions:d.transactions.filter(t=>t.id!==id)}))
  }

  const handleAddCategory = async (obj) => {
    const nc = { id:uid(), ...obj }
    await idb.put('categories', nc)
    setAppData(d=>({...d, categories:[...d.categories,{...nc,subs:[]}]}))
  }

  const handleAddSub = async (catId, name) => {
    const sub = { id:uid(), category_id:catId, name }
    await idb.put('category_subs', sub)
    setAppData(d=>({...d, categories:d.categories.map(c=>c.id===catId?{...c,subs:[...(c.subs||[]),sub]}:c)}))
  }

  const handleAddCard = async (obj) => {
    const nc = { id:uid(), ...obj, current_bill:0, status:'open' }
    await idb.put('credit_cards', nc)
    setAppData(d=>({...d, creditCards:[...d.creditCards,nc]}))
  }

  const handlePayBill = async (id) => {
    const card = appData.creditCards.find(c=>c.id===id)
    if (!card) return
    const upd = {...card, status:'paid', current_bill:0}
    await idb.put('credit_cards', upd)
    setAppData(d=>({...d, creditCards:d.creditCards.map(c=>c.id===id?upd:c)}))
  }

  const handleAddGoal = async (obj) => {
    const ng = { id:uid(), ...obj }
    await idb.put('goals', ng)
    setAppData(d=>({...d, goals:[...d.goals,ng]}))
  }

  const handleUpdateGoal = async (id,obj) => {
    const g = appData.goals.find(g=>g.id===id)
    if (!g) return
    const upd = {...g,...obj}
    await idb.put('goals', upd)
    setAppData(d=>({...d, goals:d.goals.map(g=>g.id===id?upd:g)}))
  }

  const handleAddInstallment = obj => setAppData(d=>({...d,installments:[...d.installments,obj]}))
  const handleAddRecurring   = obj => setAppData(d=>({...d,recurring:[...d.recurring,obj]}))

  // Voice flow — handle new category creation
  const handleVoiceReady = async (parsed) => {
    setVoiceOpen(false)
    if (parsed.newCategoryName) {
      const newCat = {
        id: uid(), name: parsed.newCategoryName,
        color: ['#f59e0b','#7c3aed','#ef4444','#06b6d4','#f472b6'][Math.floor(Math.random()*5)],
        type: parsed.type || 'expense', cost_center_id: parsed.costCenterId || 'personal', subs: []
      }
      await idb.put('categories', newCat)
      setAppData(d => ({ ...d, categories: [...d.categories, { ...newCat, subs: [] }] }))
      const withCat = { ...parsed, categoryId: newCat.id, newCategoryName: undefined }
      setNotification(withCat)
      showVoiceNotification(withCat, appData)
    } else {
      setNotification(parsed)
      showVoiceNotification(parsed, appData)
    }
  }

  const handleNotificationConfirm = async () => {
    if (!notification) return
    await handleAddTransaction({
      description:    notification.description||'',
      amount:         Number(notification.amount||0),
      type:           notification.type||'expense',
      category_id:    notification.categoryId||null,
      sub_id:         notification.subId||null,
      cost_center_id: notification.costCenterId||null,
      card_id:        notification.cardId||null,
      date:           today(),
    })
    setNotification(null)
    if (navigator.vibrate) navigator.vibrate([40,30,80,30,40])
  }

  const handleNotificationRedo = () => {
    const n = notification; setNotification(null)
    setPrefill({ description:n.description||'', amount:String(n.amount||''), type:n.type||'expense', categoryId:n.categoryId||'', subId:'', costCenterId:n.costCenterId||'', cardId:n.cardId||'', date:today() })
    setAddOpen(true)
  }

  const openAdd = (type=null) => { setPrefill(type?{type}:null); setAddOpen(true) }

  // ── Auth gates ────────────────────────────────────────
  if (authLoading) return (
    <div style={{ height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:P.bg }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:46 }}>💰</div>
        <div className="spin" style={{ width:24,height:24,border:`2px solid ${P.primaryL}`,borderTopColor:P.primary,borderRadius:'50%',margin:'12px auto 0' }}/>
      </div>
    </div>
  )

  if (!user) return <Login/>

  if (!dataReady) return (
    <div style={{ height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:P.bg }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40,marginBottom:10 }}>💰</div>
        <div className="spin" style={{ width:22,height:22,border:`2px solid ${P.primaryL}`,borderTopColor:P.primary,borderRadius:'50%',margin:'0 auto' }}/>
      </div>
    </div>
  )

  if (showOnboarding) return (
    <Onboarding
      user={user}
      onComplete={() => setShowOnboarding(false)}
      onAddCard={async (obj) => { await handleAddCard(obj) }}
      onAddGoal={async (obj) => { await handleAddGoal(obj) }}
    />
  )

  if (screen==='profile') return (
    <div style={{ display:'flex',minHeight:'100vh',background:P.bg }}>
      {!isMobile && <Sidebar screen={screen} setScreen={setScreen} onExportPDF={()=>exportPDF(appData,user,period)}/>}
      <div style={{ flex:1,marginLeft:isMobile?0:220 }}><Profile onBack={()=>setScreen('dashboard')}/></div>
    </div>
  )

  const readOnly = !can('canCreate')
  const sp = { appData, period, setPeriod }
  const screens = {
    dashboard:    <Dashboard    {...sp} user={user} onVoice={()=>setVoiceOpen(true)} onAdd={openAdd} setScreen={setScreen}/>,
    transactions: <Transactions {...sp} onDelete={handleDeleteTransaction}/>,
    categories:   <Categories   {...sp} onAddCategory={handleAddCategory} onAddSub={handleAddSub}/>,
    cards:        <Cards        {...sp} onAddCard={handleAddCard} onPayBill={handlePayBill}/>,
    goals:        <Goals        {...sp} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal}/>,
    installments: <Installments {...sp} onAddInstallment={handleAddInstallment} onAddRecurring={handleAddRecurring}/>,
    settings:     <Settings     {...sp} setData={setAppData}/>,
  }

  return (
    <div style={{ display:'flex',minHeight:'100vh',background:P.bg }}>
      {!isMobile && <Sidebar screen={screen} setScreen={setScreen} onExportPDF={()=>exportPDF(appData,user,period)}/>}

      <div style={{ flex:1,marginLeft:isMobile?0:220,paddingBottom:isMobile?70:0,minHeight:'100vh',overflowY:'auto' }}>
        {readOnly && <div style={{ background:'#fffbeb',borderBottom:`1px solid #fde68a`,padding:'6px 20px',fontSize:11,color:'#92400e' }}>👁 Modo visualização</div>}
        {!isMobile && <button onClick={()=>setScreen('profile')} style={{ position:'fixed',top:16,right:16,zIndex:100,width:36,height:36,borderRadius:'50%',background:P.primaryL,border:'none',fontSize:18,cursor:'pointer' }}>{user.avatar||'👤'}</button>}
        {screens[screen]||screens.dashboard}
      </div>

      {isMobile && (
        <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:`1px solid ${P.border}`,display:'flex',justifyContent:'space-around',alignItems:'center',padding:'8px 0 max(12px,env(safe-area-inset-bottom))',zIndex:50 }}>
          {MOBILE_NAV.map((item,i) => {
            if (i===2) return (
              <div key="mic" style={{ position:'relative',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <button onClick={()=>setVoiceOpen(true)} style={{ position:'absolute',bottom:4,width:54,height:54,borderRadius:'50%',background:readOnly?P.muted:P.primary,border:`3px solid ${P.bg}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 4px 18px ${P.primary}50`,zIndex:11 }} disabled={readOnly}>
                  <Icon n="mic" size={22} color="#fff"/>
                </button>
                <div style={{ width:54,height:30 }}/>
              </div>
            )
            const active = screen===item.id
            return (
              <button key={item.id} onClick={()=>setScreen(item.id)} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'transparent',border:'none',cursor:'pointer',padding:'4px 8px',minWidth:52 }}>
                <Icon n={item.icon} size={20} color={active?P.primary:'#ccc'}/>
                <span style={{ fontSize:9,color:active?P.primary:'#ccc',fontWeight:active?600:400 }}>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {!readOnly && (
        <button onClick={()=>openAdd()} style={{ position:'fixed',bottom:isMobile?76:20,right:16,width:46,height:46,borderRadius:'50%',background:P.text,border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',zIndex:40,boxShadow:'0 2px 14px rgba(0,0,0,.2)' }}>
          <Icon n="plus" size={20} color="#fff"/>
        </button>
      )}

      {isMobile && !voiceOpen && !notification && !addOpen && (
        <div style={{ position:'fixed',bottom:86,left:16,fontSize:10,color:P.muted,zIndex:39,background:'rgba(255,255,255,.85)',padding:'4px 9px',borderRadius:6,pointerEvents:'none',backdropFilter:'blur(4px)' }}>
          📳 Agite para usar voz
        </div>
      )}

      <VoiceModal open={voiceOpen} onClose={()=>setVoiceOpen(false)} appData={appData} onReady={handleVoiceReady}/>
      {!readOnly && <AddTransactionModal open={addOpen} onClose={()=>{setAddOpen(false);setPrefill(null)}} onAdd={handleAddTransaction} appData={appData} prefill={prefill}/>}
      {notification && <VoiceNotification preview={notification} appData={appData} onConfirm={handleNotificationConfirm} onRedo={handleNotificationRedo}/>}
    </div>
  )
}

