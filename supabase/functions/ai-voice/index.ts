// Supabase Edge Function — ai-voice
// Mantém a chave da Anthropic segura no servidor
// Deploy: supabase functions deploy ai-voice

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, catList, ccList, cardList } = await req.json()

    const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `Você é um assistente financeiro brasileiro. Extraia informações de comandos de voz e retorne APENAS um JSON válido, sem markdown, sem texto adicional.

Formato obrigatório:
{
  "description": "descrição curta e clara",
  "amount": numero_positivo,
  "type": "expense" ou "income",
  "categoryId": "id_da_categoria_ou_null",
  "costCenterId": "id_do_centro_ou_null",
  "cardId": "id_do_cartao_ou_null",
  "confidence": 0.0_a_1.0
}`,
        messages: [{
          role: 'user',
          content: `Categorias disponíveis (id|nome): ${catList}
Centros de custo (id|nome): ${ccList}
Cartões (id|nome): ${cardList}

Comando de voz: "${text}"

Analise e retorne o JSON.`
        }]
      })
    })

    const data = await response.json()
    const raw = data.content?.[0]?.text || '{}'
    const parsed = JSON.parse(raw.replace(/```json?|```/g, '').trim())

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
