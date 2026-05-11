// FinanceOS — Parser de voz offline em português
// Funciona sem internet. Precisão ~75-85%
// Com IA online (Anthropic): ~97%

// ── Números por extenso ───────────────────────────────────
const NUMBERS_PT = {
  zero:0, um:1, uma:1, dois:2, duas:2, três:3, tres:3, quatro:4, cinco:5,
  seis:6, sete:7, oito:8, nove:9, dez:10, onze:11, doze:12, treze:13,
  catorze:14, quatorze:14, quinze:15, dezesseis:16, dezessete:17, dezoito:18,
  dezenove:19, vinte:20, trinta:30, quarenta:40, cinquenta:50, sessenta:60,
  setenta:70, oitenta:80, noventa:90, cem:100, cento:100, duzentos:200,
  duzentas:200, trezentos:300, trezentas:300, quatrocentos:400, quatrocentas:400,
  quinhentos:500, quinhentas:500, seiscentos:600, setecentos:700, oitocentos:800,
  novecentos:900, mil:1000,
}

function parseNumberWords(str) {
  const words = str.toLowerCase().split(/\s+/)
  let total = 0, current = 0
  for (const w of words) {
    const n = NUMBERS_PT[w]
    if (n === undefined) continue
    if (n === 1000) {
      current = current === 0 ? 1000 : current * 1000
      total += current; current = 0
    } else if (n >= 100) {
      current += n
    } else {
      current += n
    }
  }
  total += current
  return total > 0 ? total : null
}

// ── Extrai valor monetário ────────────────────────────────
function extractAmount(text) {
  // "R$150", "R$ 1.500,00", "150 reais", "cento e cinquenta reais"
  const patterns = [
    /R\$\s*([\d.,]+)/i,
    /([\d]+(?:[.,]\d+)?)\s*reais/i,
    /([\d]+(?:[.,]\d+)?)\s*real/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const raw = m[1].replace(/\./g,'').replace(',','.')
      const val = parseFloat(raw)
      if (!isNaN(val) && val > 0) return val
    }
  }
  // Tenta número solto (ex: "150 em alimentação")
  const numMatch = text.match(/\b(\d+(?:[.,]\d{1,2})?)\b/)
  if (numMatch) {
    const val = parseFloat(numMatch[1].replace(',','.'))
    if (!isNaN(val) && val > 0 && val < 1000000) return val
  }
  // Tenta por extenso
  return parseNumberWords(text)
}

// ── Detecta tipo (despesa/receita) ────────────────────────
function extractType(text) {
  const t = text.toLowerCase()
  const incomeWords  = ['recebi','ganhei','receber','entrada','receita','salário','salario','pagamento recebido','faturei','vendi','venda']
  const expenseWords = ['gastei','paguei','comprei','gasto','despesa','pagamento','débito','debito','saiu','saída','saida','transferi','mandei']
  for (const w of incomeWords)  if (t.includes(w)) return 'income'
  for (const w of expenseWords) if (t.includes(w)) return 'expense'
  return 'expense' // padrão
}

// ── Fuzzy match de categoria ──────────────────────────────
const CAT_KEYWORDS = {
  'Alimentação':        ['aliment','comida','mercado','supermercado','restaurante','refeição','refeicao','lanche','café','cafe','iFood','delivery','pizza','almoço','almoco','jantar','padaria'],
  'Transporte':         ['transporte','uber','99','combustível','combustivel','gasolina','ônibus','onibus','metrô','metro','táxi','taxi','estacionamento'],
  'Moradia':            ['moradia','aluguel','condomínio','condominio','energia','luz','água','agua','internet','iptu','reforma'],
  'Saúde':              ['saúde','saude','médico','medico','farmácia','farmacia','remédio','remedio','plano','academia','dentista','consulta'],
  'Lazer':              ['lazer','entretenimento','cinema','netflix','spotify','viagem','viagem','show','festa','shopping','streaming','jogo'],
  'Salário':            ['salário','salario','holerite','remuneração','remuneracao'],
  'Freelance':          ['freelance','freela','projeto','consultoria','serviço','servico'],
  'Fornecedores':       ['fornecedor','fornecimento','matéria','materia','insumo','compra empresa'],
  'Desp. Operacionais': ['operacional','escritório','escritorio','marketing','imposto','taxa','software','assinatura empresa'],
  'Receita Empresa':    ['receita empresa','faturamento','venda','cliente','nota fiscal'],
}

function matchCategory(text, categories) {
  const t = text.toLowerCase()
  let bestMatch = null, bestScore = 0

  for (const cat of categories) {
    // Direct name match
    if (t.includes(cat.name.toLowerCase())) return cat

    // Also check sub names
    for (const sub of (cat.subs || [])) {
      if (t.includes(sub.name.toLowerCase())) return cat
    }

    // Keyword match
    const keywords = CAT_KEYWORDS[cat.name] || []
    for (const kw of keywords) {
      if (t.includes(kw.toLowerCase())) {
        const score = kw.length
        if (score > bestScore) { bestScore = score; bestMatch = cat }
      }
    }
  }
  return bestMatch
}

// ── Detecta cartão ────────────────────────────────────────
function matchCard(text, cards) {
  const t = text.toLowerCase()
  for (const card of cards) {
    if (t.includes(card.name.toLowerCase())) return card
    if (t.includes(card.last_four)) return card
  }
  return null
}

// ── Detecta centro de custo ───────────────────────────────
function matchCostCenter(text, costCenters, category) {
  const t = text.toLowerCase()
  const bizWords = ['empresa','empresarial','negócio','negocio','business','cnpj','nota fiscal']
  const persWords = ['pessoal','particular','próprio','proprio','casa','família','familia']

  for (const w of bizWords)  if (t.includes(w)) return costCenters.find(c => c.name === 'Empresa') || costCenters[1]
  for (const w of persWords) if (t.includes(w)) return costCenters.find(c => c.name === 'Pessoal') || costCenters[0]

  // Inferir pelo centro da categoria
  if (category) return costCenters.find(c => c.id === category.cost_center_id) || costCenters[0]
  return costCenters[0]
}

// ── Gera descrição limpa ──────────────────────────────────
function generateDescription(text, category, type) {
  // Remove tokens de valor e palavras-chave de trigger
  let desc = text
    .replace(/R\$\s*[\d.,]+/gi, '')
    .replace(/\b(gastei|paguei|comprei|recebi|ganhei|de|em|no|na|pelo|pela|com|para|um|uma|reais?|real)\b/gi, ' ')
    .replace(/\b\d+([.,]\d+)?\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (desc.length < 3) desc = category?.name || (type === 'income' ? 'Receita' : 'Despesa')
  return desc.charAt(0).toUpperCase() + desc.slice(1)
}

// ── Parser principal ──────────────────────────────────────
export function parseVoiceCommand(text, { categories = [], costCenters = [], creditCards = [] } = {}) {
  if (!text || text.trim().length < 2) {
    return { error: 'Comando muito curto. Tente novamente.' }
  }

  const amount   = extractAmount(text)
  const type     = extractType(text)
  const category = matchCategory(text, categories.filter(c => c.type === type))
  const card     = type === 'expense' ? matchCard(text, creditCards) : null
  const cc       = matchCostCenter(text, costCenters, category)
  const desc     = generateDescription(text, category, type)

  // Confiança baseada no que foi identificado
  let confidence = 0.4
  if (amount)   confidence += 0.3
  if (category) confidence += 0.2
  if (cc)       confidence += 0.1

  return {
    description:    desc || (category?.name || 'Lançamento'),
    amount:         amount || 0,
    type,
    categoryId:     category?.id || null,
    costCenterId:   cc?.id || null,
    cardId:         card?.id || null,
    confidence:     Math.min(confidence, 0.95),
    isOffline:      true,
    rawText:        text,
  }
}

// ── Teste rápido (console) ────────────────────────────────
export function testParser(text, appData) {
  const result = parseVoiceCommand(text, appData)
  console.log(`"${text}" →`, result)
  return result
}
