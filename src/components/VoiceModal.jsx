import { useState, useRef, useEffect } from 'react'
import Modal from './Modal.jsx'
import Icon from './Icon.jsx'
import { Spinner, Btn } from './ui.jsx'
import { P } from '../lib/helpers.js'
import { parseVoiceOffline, hasSpeechRecognition } from '../lib/offlineVoice.js'
import { getVoiceHistory, addToVoiceHistory } from '../lib/voiceHistory.js'

const EXAMPLES = [
  '"R$150 em alimentação"',
  '"R$400 no Nubank em fornecedores empresa"',
  '"Recebi R$2.000 de consultoria"',
  '"R$80 no iFood delivery"',
]

export default function VoiceModal({ open, onClose, appData, onReady }) {
  const [phase, setPhase]       = useState('idle') // idle | listening | processing | preview | error
  const [transcript, setTranscript] = useState('')
  const [manual, setManual]     = useState('')
  const [preview, setPreview]   = useState(null)
  const [err, setErr]           = useState('')
  const [history, setHistory]   = useState([])
  const recogRef = useRef(null)

  useEffect(() => {
    if (open) {
      setHistory(getVoiceHistory())
    } else {
      setPhase('idle'); setTranscript(''); setManual(''); setPreview(null); setErr('')
    }
  }, [open])

  const parseText = async (text) => {
    setPhase('processing')
    await new Promise(r => setTimeout(r, 600))

    const edgeUrl = import.meta.env.VITE_ANTHROPIC_EDGE_URL
    let result = null

    if (edgeUrl && navigator.onLine) {
      try {
        const catList  = appData.categories.map(c => `${c.id}|${c.name}(${c.type})`).join(', ')
        const ccList   = appData.costCenters.map(c => `${c.id}|${c.name}`).join(', ')
        const cardList = appData.creditCards.map(c => `${c.id}|${c.name}`).join(', ')
        const res = await fetch(edgeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ text, catList, ccList, cardList }),
          signal: AbortSignal.timeout(5000),
        })
        const d = await res.json()
        if (d && !d.error) result = { ...d, offline: false }
      } catch {}
    }

    if (!result) result = parseVoiceOffline(text, appData)

    if (!result || !result.amount) {
      setErr('Não consegui identificar o valor. Tente digitar o comando.')
      setPhase('error'); return
    }

    // Salva no histórico
    addToVoiceHistory({ text, preview: result })
    setHistory(getVoiceHistory())

    setPreview({ ...result, date: new Date().toISOString().split('T')[0] })
    setPhase('preview')
  }

  const startListening = () => {
    if (!hasSpeechRecognition()) { setPhase('manual'); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'pt-BR'; r.continuous = false; r.interimResults = true
    r.onstart = () => { setPhase('listening'); setTranscript('') }
    r.onresult = e => {
      const t = Array.from(e.results).map(x => x[0].transcript).join('')
      setTranscript(t)
      if (e.results[e.results.length - 1].isFinal) { r.stop(); parseText(t) }
    }
    r.onerror = () => setPhase('manual')
    r.start(); recogRef.current = r
  }

  const getName = (list, id) => list?.find(x => x.id === id)?.name || '—'
  const confirm = () => { if (preview) { onReady(preview); onClose() } }

  const inpS = { width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${P.border}`, background: P.light, color: P.text, fontSize: 13, outline: 'none' }

  return (
    <Modal open={open} onClose={onClose} title="Lançamento por voz">
      {(phase === 'idle' || phase === 'manual') && (
        <div className="fade-in">
          {/* Quick action */}
          <button onClick={startListening}
            style={{ width: '100%', padding: 16, background: P.primary, color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon n="mic" size={20} color="#fff"/>
            </div>
            Toque para falar
          </button>

          {/* Text fallback */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input style={{ ...inpS, flex: 1 }} placeholder='ou digite: "R$150 alimentação"' value={manual} onChange={e => setManual(e.target.value)} onKeyDown={e => e.key === 'Enter' && manual && parseText(manual)} />
            <button onClick={() => manual && parseText(manual)} style={{ padding: '10px 14px', background: P.primary, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Icon n="brain" size={16} color="#fff"/>
            </button>
          </div>

          {/* Online/offline indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: P.muted }}>Exemplos de comandos</div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: navigator.onLine ? '#f0fdf4' : '#f9fafb', color: navigator.onLine ? '#16a34a' : P.muted }}>
              {navigator.onLine ? '🌐 IA online' : '📴 Parser offline'}
            </span>
          </div>
          {EXAMPLES.map(e => <div key={e} style={{ fontSize: 11, color: P.muted, padding: '2px 0' }}>{e}</div>)}

          {/* Voice history */}
          {history.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: P.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: .4 }}>Histórico — toque para repetir</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {history.slice(0, 5).map((h, i) => (
                  <button key={i} onClick={() => parseText(h.text)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: P.light, border: `1px solid ${P.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 14 }}>🔁</span>
                    <span style={{ flex: 1, fontSize: 12, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.text}</span>
                    <span style={{ fontSize: 10, color: P.muted, flexShrink: 0 }}>{new Date(h.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'listening' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '28px 0' }}>
          <div className="pulse" style={{ width: 80, height: 80, borderRadius: '50%', background: P.primaryL, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon n="mic" size={36} color={P.primary}/>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Ouvindo...</div>
          {transcript && <div style={{ fontSize: 12, color: P.muted, marginTop: 8, fontStyle: 'italic' }}>"{transcript}"</div>}
          <button onClick={() => { recogRef.current?.stop(); setPhase('idle') }}
            style={{ marginTop: 14, padding: '7px 16px', border: `1px solid ${P.border}`, borderRadius: 8, background: 'transparent', color: P.muted, fontSize: 12, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      )}

      {phase === 'processing' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Spinner/></div>
          <div style={{ fontSize: 13, color: P.muted }}>{navigator.onLine ? 'IA analisando comando...' : 'Parser offline processando...'}</div>
          {transcript && <div style={{ fontSize: 11, color: P.muted, marginTop: 6, fontStyle: 'italic' }}>"{transcript}"</div>}
        </div>
      )}

      {phase === 'preview' && preview && (
        <div className="fade-in">
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✅ {preview.offline ? 'Parser offline' : 'IA'} identificou</span>
              {preview.confidence && <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: 5 }}>{Math.round(preview.confidence * 100)}% confiança</span>}
            </div>
            <div style={{ display: 'grid', gap: 5 }}>
              {[
                ['Descrição', preview.description],
                ['Valor', `R$ ${Number(preview.amount || 0).toFixed(2)}`],
                ['Tipo', preview.type === 'expense' ? 'Despesa' : preview.type === 'income' ? 'Receita' : 'Investimento'],
                ['Categoria', getName(appData.categories, preview.categoryId)],
                ['Centro de custo', getName(appData.costCenters, preview.costCenterId)],
                ['Cartão', preview.cardId ? getName(appData.creditCards, preview.cardId) : 'Sem cartão'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: P.muted }}>{k}</span>
                  <span style={{ color: P.text, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn outline onClick={() => setPhase('manual')} style={{ flex: 1 }}>Editar</Btn>
            <Btn color="#16a34a" onClick={confirm} style={{ flex: 2 }}>Confirmar lançamento</Btn>
          </div>
        </div>
      )}

      {phase === 'error' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
          <div style={{ fontSize: 13, color: P.muted, marginBottom: 16 }}>{err}</div>
          <Btn onClick={() => setPhase('idle')}>Tentar novamente</Btn>
        </div>
      )}
    </Modal>
  )
}
