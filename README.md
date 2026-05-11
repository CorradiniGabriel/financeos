# FinanceOS 💰

App de gestão financeira híbrida (pessoal + empresa) com IA por voz.

## Stack
- **Frontend**: React 18 + Vite
- **Backend/DB**: Supabase (Auth + PostgreSQL)
- **IA**: Claude (Anthropic) via Supabase Edge Function
- **Deploy**: Vercel (free)

---

## 🚀 Setup em 4 passos (tudo grátis)

### 1. Supabase (banco de dados + autenticação)

1. Acesse **https://supabase.com** → crie uma conta gratuita
2. Crie um novo projeto (anote a senha do banco)
3. Vá em **SQL Editor** → cole e execute o conteúdo de `supabase/schema.sql`
4. Vá em **Project Settings → API** e copie:
   - `Project URL`
   - `anon public` key

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:
```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
VITE_ANTHROPIC_EDGE_URL=https://SEU_PROJETO.supabase.co/functions/v1/ai-voice
```

### 3. Edge Function para IA por voz (Supabase)

```bash
# Instale a CLI do Supabase
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Adicione sua chave da Anthropic (https://console.anthropic.com)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy da função
supabase functions deploy ai-voice
```

### 4. Deploy no Vercel (free)

```bash
# Instale a CLI do Vercel
npm install -g vercel

# Na pasta do projeto:
npm install
vercel --prod
```

Siga o assistente do Vercel. Quando pedir variáveis de ambiente, adicione as 3 do `.env`.

---

## 💻 Desenvolvimento local

```bash
npm install
npm run dev
# App em http://localhost:3000
```

---

## 💰 Custos

| Serviço | Tier gratuito | Pago |
|---------|--------------|------|
| Supabase | 500MB DB, 2GB bandwidth/mês | a partir de $25/mês |
| Vercel | Projetos ilimitados | a partir de $20/mês |
| Anthropic (IA voz) | — | ~R$0,003/comando |

**Para testes: $0/mês** (apenas centavos na Anthropic se usar bastante o comando de voz)

---

## 🏗️ Estrutura do projeto

```
financeos/
├── src/
│   ├── App.jsx               # App principal + auth + state
│   ├── lib/
│   │   ├── supabase.js       # Client + CRUD
│   │   └── helpers.js        # Cores, formatação
│   ├── components/
│   │   ├── VoiceModal.jsx    # IA por voz
│   │   ├── AddTransactionModal.jsx
│   │   ├── Modal.jsx
│   │   ├── Icon.jsx
│   │   └── ui.jsx            # Componentes base
│   └── screens/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Transactions.jsx
│       ├── Categories.jsx
│       ├── Cards.jsx
│       └── Goals.jsx
├── supabase/
│   ├── schema.sql            # Schema completo do banco
│   └── functions/ai-voice/  # Edge Function para IA
└── .env.example
```

---

## ✨ Funcionalidades

- ✅ Autenticação (email/senha)
- ✅ Dashboard com saldo, centros de custo e lançamentos
- ✅ Lançamento por **voz com IA** → categoriza automaticamente
- ✅ Centros de custo (Pessoal / Empresa / Investimentos)
- ✅ Categorias com subcategorias infinitas
- ✅ Cartões de crédito com datas de fechamento e vencimento
- ✅ Regime de caixa: cartão só impacta saldo ao pagar fatura
- ✅ Metas financeiras com progresso
- ✅ Filtros por tipo e centro de custo
- ✅ Dados isolados por usuário (Row Level Security)
