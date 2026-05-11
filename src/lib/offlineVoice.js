// Parser de voz OFFLINE + detecção de intenções especiais
const INCOME_WORDS   = ['recebi','receita','entrada','salário','salario','ganhei','ganho','recebimento','freelance','consultoria','renda']
const EXPENSE_WORDS  = ['gastei','gasto','paguei','pagamento','despesa','comprei','compra','conta','débito','debito']
const BUSINESS_WORDS = ['empresa','negócio','negocio','escritório','escritorio','trabalho','cnpj','mei']
const NEW_CAT_WORDS  = ['categoria nova','nova categoria','categoria chamada','categoria:','criar categoria','cria categoria','crie categoria']
const INVEST_WORDS   = ['investi','investimento','investir','aplicar','aplicação','tesouro','fundo','ação','ações','cripto']

function extractAmount(text) {
  const t = text.toLowerCase()
  const r1 = t.match(/r?\$\s*(\d+(?:[.,]\d{1,2})?(?:\.\d{3})*)/i)
  if (r1) return parseFloat(r1[1].replace(/\./g,'').replace(',','.'))
  const r2 = t.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:reais?|real|conto|pilas?)/i)
  if (r2) return parseFloat(r2[1].replace(',','.'))
  const r3 = t.match(/\b(\d+(?:[.,]\d{1,2})?)\b/)
  if (r3) { const v=parseFloat(r3[1].replace(',','.')); if(v>0&&v<1000000) return v }
  return null
}

function similarity(a,b) {
  a=a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  b=b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  if(a===b) return 1
  if(b.includes(a)||a.includes(b)) return 0.85
  const wa=a.split(/\s+/), wb=b.split(/\s+/)
  const m=wa.filter(w=>w.length>2&&wb.some(x=>x.includes(w)||w.includes(x)))
  return m.length/Math.max(wa.length,wb.length)
}

function detectType(text) {
  const t=text.toLowerCase()
  if(INVEST_WORDS.some(w=>t.includes(w))) return 'investment'
  const i=INCOME_WORDS.filter(w=>t.includes(w)).length
  const e=EXPENSE_WORDS.filter(w=>t.includes(w)).length
  return i>e?'income':'expense'
}

// Detecta se o usuário quer criar uma categoria nova
function detectNewCategory(text) {
  const t=text.toLowerCase()
  for(const kw of NEW_CAT_WORDS) {
    if(t.includes(kw)) {
      // Extrai o nome da categoria após a keyword
      const idx=t.indexOf(kw)+kw.length
      const rest=text.slice(idx).trim()
      // Pega as primeiras 1-3 palavras como nome da categoria
      const name=rest.split(/[\s,\.]/g).filter(Boolean).slice(0,3).join(' ')
      return name.charAt(0).toUpperCase()+name.slice(1)
    }
  }
  // Padrão: "R$50 em [palavra desconhecida]" onde palavra não existe nas categorias
  return null
}

function findCategory(text,categories,type) {
  const t=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  let best=null,bestScore=0.25
  for(const cat of categories.filter(c=>c.type===type)) {
    const s=similarity(t,cat.name)
    if(s>bestScore){bestScore=s;best=cat.id}
    for(const sub of cat.subs||[]) {
      const ss=similarity(t,sub.name)*0.9
      if(ss>bestScore){bestScore=ss;best=cat.id}
    }
  }
  return best
}

function findCard(text,cards) {
  const t=text.toLowerCase()
  for(const c of cards) { if(t.includes(c.name.toLowerCase())) return c.id }
  if(/cartão|cartao|crédito|credito|nubank|itaú|itau|bradesco|inter/i.test(t)) return cards[0]?.id??null
  return null
}

function findCostCenter(text,ccs) {
  const t=text.toLowerCase()
  for(const cc of ccs) { if(t.includes(cc.name.toLowerCase())) return cc.id }
  if(BUSINESS_WORDS.some(w=>t.includes(w))) return ccs.find(c=>c.name.toLowerCase().includes('empresa'))?.id??null
  return ccs.find(c=>c.name.toLowerCase().includes('pessoal'))?.id??ccs[0]?.id??null
}

function makeDescription(text,type) {
  let d=text
    .replace(/r?\$\s*[\d.,]+/gi,'')
    .replace(/\b\d+(?:[.,]\d{1,2})?\b/g,'')
    .replace(/\b(reais?|real|conto|pilas?)\b/gi,'')
    .replace(/\b(gastei|gasto|paguei|recebi|ganhei|comprei|investi)\b/gi,'')
    .replace(/\b(em|no|na|do|da|pelo|para|com)\b/gi,'')
    .replace(/categoria\s+(nova|chamada|:)/gi,'')
    .replace(/\s+/g,' ').trim()
  d=d.charAt(0).toUpperCase()+d.slice(1)
  if(d.length<3) d=type==='income'?'Receita':type==='investment'?'Investimento':'Despesa'
  return d
}

export function parseVoiceOffline(text, appData) {
  if(!text?.trim()) return null
  const type=detectType(text)
  const amount=extractAmount(text)
  const newCategoryName=detectNewCategory(text)
  const categoryId=newCategoryName?null:findCategory(text,appData.categories||[],type)
  const cardId=type==='expense'?findCard(text,appData.creditCards||[]):null
  const costCenterId=findCostCenter(text,appData.costCenters||[])
  const description=makeDescription(text,type)
  const confidence=amount?(newCategoryName?0.8:categoryId?0.85:0.6):0.3

  return { description, amount, type, categoryId, costCenterId, cardId, confidence, offline:true, newCategoryName }
}

export function hasSpeechRecognition() {
  return !!(window.SpeechRecognition||window.webkitSpeechRecognition)
}
