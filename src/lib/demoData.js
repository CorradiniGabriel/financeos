// Dados iniciais limpos — apenas categorias e centros de custo básicos
// Cada usuário começa do zero e preenche seus próprios dados

export const CLEAN_SEED = {
  costCenters: [
    { id: 'personal', name: 'Pessoal',       color: '#4f6ef7', icon: '👤' },
    { id: 'business', name: 'Empresa',       color: '#7c3aed', icon: '🏢' },
    { id: 'invest',   name: 'Investimentos', color: '#22c55e', icon: '📈' },
  ],
  categories: [
    { id: 'housing',   name: 'Moradia',      color: '#3b82f6', type: 'expense', cost_center_id: 'personal',
      subs: [{ id: 'h1', name: 'Aluguel' }, { id: 'h2', name: 'Condomínio' }, { id: 'h3', name: 'Energia elétrica' }, { id: 'h4', name: 'Internet' }] },
    { id: 'food',      name: 'Alimentação',  color: '#f59e0b', type: 'expense', cost_center_id: 'personal',
      subs: [{ id: 'f1', name: 'Supermercado' }, { id: 'f2', name: 'Restaurante' }, { id: 'f3', name: 'Delivery' }, { id: 'f4', name: 'Padaria' }] },
    { id: 'health',    name: 'Saúde',        color: '#22c55e', type: 'expense', cost_center_id: 'personal',
      subs: [{ id: 'sa1', name: 'Plano de saúde' }, { id: 'sa2', name: 'Farmácia' }, { id: 'sa3', name: 'Consultas' }, { id: 'sa4', name: 'Academia' }] },
    { id: 'leisure',   name: 'Lazer',        color: '#f472b6', type: 'expense', cost_center_id: 'personal',
      subs: [{ id: 'l1', name: 'Streaming' }, { id: 'l2', name: 'Viagem' }, { id: 'l3', name: 'Entretenimento' }, { id: 'l4', name: 'Esportes' }] },
    { id: 'transport', name: 'Transporte',   color: '#7c3aed', type: 'expense', cost_center_id: 'personal',
      subs: [{ id: 't1', name: 'Combustível' }, { id: 't2', name: 'Uber/99' }, { id: 't3', name: 'Transporte público' }, { id: 't4', name: 'Estacionamento' }] },
    { id: 'salary',    name: 'Salário',      color: '#22c55e', type: 'income',  cost_center_id: 'personal', subs: [] },
    { id: 'freela',    name: 'Freelance',    color: '#06b6d4', type: 'income',  cost_center_id: 'personal', subs: [] },
    { id: 'biz_exp',   name: 'Despesas Empresa', color: '#f59e0b', type: 'expense', cost_center_id: 'business',
      subs: [{ id: 'b1', name: 'Fornecedores' }, { id: 'b2', name: 'Marketing' }, { id: 'b3', name: 'Impostos' }] },
    { id: 'biz_inc',   name: 'Receita Empresa',  color: '#22c55e', type: 'income',  cost_center_id: 'business', subs: [] },
    { id: 'invest_cat',name: 'Investimentos',     color: '#22c55e', type: 'investment', cost_center_id: 'invest', subs: [] },
  ],
  // Tudo vazio — usuário preenche do zero
  creditCards:  [],
  transactions: [],
  goals:        [],
  installments: [],
  recurring:    [],
  budgets:      [],
}
