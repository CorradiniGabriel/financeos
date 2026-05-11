import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  || ''
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(url, key)

// ── helpers ──────────────────────────────────────────────
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email, password) {
  return supabase.auth.signUp({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

// ── SEED DATA para novo usuário ───────────────────────────
export async function seedDefaultData(userId) {
  // Centros de custo
  const { data: ccData } = await supabase.from('cost_centers').insert([
    { user_id: userId, name: 'Pessoal',       color: '#4f6ef7', icon: '👤' },
    { user_id: userId, name: 'Empresa',       color: '#7c3aed', icon: '🏢' },
    { user_id: userId, name: 'Investimentos', color: '#22c55e', icon: '📈' },
  ]).select()

  if (!ccData) return
  const [personal, business] = ccData

  // Categorias
  const { data: catData } = await supabase.from('categories').insert([
    { user_id: userId, name: 'Alimentação',          color: '#f59e0b', type: 'expense', cost_center_id: personal.id },
    { user_id: userId, name: 'Transporte',           color: '#7c3aed', type: 'expense', cost_center_id: personal.id },
    { user_id: userId, name: 'Moradia',              color: '#3b82f6', type: 'expense', cost_center_id: personal.id },
    { user_id: userId, name: 'Saúde',                color: '#22c55e', type: 'expense', cost_center_id: personal.id },
    { user_id: userId, name: 'Lazer',                color: '#f472b6', type: 'expense', cost_center_id: personal.id },
    { user_id: userId, name: 'Salário',              color: '#22c55e', type: 'income',  cost_center_id: personal.id },
    { user_id: userId, name: 'Freelance',            color: '#06b6d4', type: 'income',  cost_center_id: personal.id },
    { user_id: userId, name: 'Fornecedores',         color: '#ef4444', type: 'expense', cost_center_id: business.id },
    { user_id: userId, name: 'Desp. Operacionais',   color: '#f59e0b', type: 'expense', cost_center_id: business.id },
    { user_id: userId, name: 'Receita Empresa',      color: '#22c55e', type: 'income',  cost_center_id: business.id },
  ]).select()

  if (!catData) return

  // Subcategorias
  const subMap = {
    'Alimentação':        ['Supermercado','Restaurante','Delivery','Padaria'],
    'Transporte':         ['Combustível','Uber/99','Transporte público','Estacionamento'],
    'Moradia':            ['Aluguel','Condomínio','Energia elétrica','Internet'],
    'Saúde':              ['Plano de saúde','Farmácia','Consultas','Academia'],
    'Lazer':              ['Streaming','Viagem','Entretenimento','Restaurante'],
    'Desp. Operacionais': ['Escritório','Marketing','Impostos','Softwares'],
  }
  const subs = []
  for (const cat of catData) {
    const subNames = subMap[cat.name] || []
    for (const name of subNames) {
      subs.push({ category_id: cat.id, name })
    }
  }
  if (subs.length) await supabase.from('category_subs').insert(subs)
}

// ── CRUD genérico ─────────────────────────────────────────
export const db = {
  async getCostCenters(userId) {
    const { data } = await supabase.from('cost_centers').select('*').eq('user_id', userId).order('created_at')
    return data || []
  },
  async addCostCenter(userId, obj) {
    const { data } = await supabase.from('cost_centers').insert({ user_id: userId, ...obj }).select().single()
    return data
  },

  async getCategories(userId) {
    const { data } = await supabase.from('categories').select('*, category_subs(*)').eq('user_id', userId).order('created_at')
    return (data || []).map(c => ({ ...c, subs: c.category_subs || [] }))
  },
  async addCategory(userId, obj) {
    const { data } = await supabase.from('categories').insert({ user_id: userId, ...obj }).select('*, category_subs(*)').single()
    return data ? { ...data, subs: data.category_subs || [] } : null
  },
  async addCategorySub(categoryId, name) {
    const { data } = await supabase.from('category_subs').insert({ category_id: categoryId, name }).select().single()
    return data
  },

  async getCreditCards(userId) {
    const { data } = await supabase.from('credit_cards').select('*').eq('user_id', userId).order('created_at')
    return data || []
  },
  async addCreditCard(userId, obj) {
    const { data } = await supabase.from('credit_cards').insert({ user_id: userId, ...obj }).select().single()
    return data
  },
  async updateCreditCard(id, obj) {
    const { data } = await supabase.from('credit_cards').update(obj).eq('id', id).select().single()
    return data
  },

  async getTransactions(userId) {
    const { data } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false })
    return data || []
  },
  async addTransaction(userId, obj) {
    const { data } = await supabase.from('transactions').insert({ user_id: userId, ...obj }).select().single()
    return data
  },
  async deleteTransaction(id) {
    return supabase.from('transactions').delete().eq('id', id)
  },

  async getGoals(userId) {
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at')
    return data || []
  },
  async addGoal(userId, obj) {
    const { data } = await supabase.from('goals').insert({ user_id: userId, ...obj }).select().single()
    return data
  },
  async updateGoal(id, obj) {
    const { data } = await supabase.from('goals').update(obj).eq('id', id).select().single()
    return data
  },
}
