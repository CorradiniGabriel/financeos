// PDF export via browser print API — sem dependências externas
export function exportPDF(appData, user, period) {
  const { transactions=[], categories=[], costCenters=[], creditCards=[], goals=[], recurring=[], installments=[], budgets=[] } = appData

  const fmt = (n) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0)
  const [year, month] = (period || new Date().toISOString().slice(0,7)).split('-')
  const monthName = new Date(year, month-1).toLocaleString('pt-BR',{month:'long',year:'numeric'})
  const getCat = id => categories.find(c=>c.id===id)

  const periodTx = transactions.filter(t => t.date?.startsWith(period || new Date().toISOString().slice(0,7)))
  const income  = periodTx.filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount),0)
  const expense = periodTx.filter(t=>t.type==='expense').reduce((a,t)=>a+Number(t.amount),0)
  const invest  = periodTx.filter(t=>t.type==='investment').reduce((a,t)=>a+Number(t.amount),0)
  const balance = income - expense - invest

  // Despesas por categoria
  const byCat = {}
  periodTx.filter(t=>t.type==='expense').forEach(t => {
    if (!byCat[t.category_id]) byCat[t.category_id] = 0
    byCat[t.category_id] += Number(t.amount)
  })
  const catRows = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([id,amt]) => {
    const cat = getCat(id)
    const pct = expense > 0 ? Math.round((amt/expense)*100) : 0
    return `
      <tr>
        <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cat?.color||'#ccc'};margin-right:6px"></span>${cat?.name||id}</td>
        <td style="text-align:right">${fmt(amt)}</td>
        <td style="text-align:right">${pct}%</td>
        <td style="padding-left:8px"><div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${cat?.color||'#4f6ef7'};border-radius:4px"></div></div></td>
      </tr>`
  }).join('')

  // Lançamentos
  const txRows = periodTx.sort((a,b)=>b.date?.localeCompare(a.date)).map(t => {
    const cat = getCat(t.category_id)
    const color = t.type==='income' ? '#16a34a' : t.type==='investment' ? '#2563eb' : '#dc2626'
    const signal = t.type==='income' ? '+' : '-'
    return `
      <tr>
        <td>${t.date?.split('-').reverse().join('/')}</td>
        <td>${t.description}</td>
        <td><span style="background:${cat?.color||'#ccc'}20;color:${cat?.color||'#666'};padding:2px 6px;border-radius:4px;font-size:11px">${cat?.name||'—'}</span></td>
        <td style="text-align:right;color:${color};font-weight:600">${signal}${fmt(t.amount)}</td>
      </tr>`
  }).join('')

  // Metas
  const goalRows = goals.map(g => {
    const pct = Math.round((Number(g.current)/Number(g.target))*100)
    return `
      <tr>
        <td>${g.icon} ${g.name}</td>
        <td style="text-align:right">${fmt(g.current)}</td>
        <td style="text-align:right">${fmt(g.target)}</td>
        <td style="text-align:right;color:${g.color};font-weight:600">${pct}%</td>
        <td style="padding-left:8px"><div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${g.color};border-radius:4px"></div></div></td>
      </tr>`
  }).join('')

  // Recorrentes
  const recRows = recurring.map(r => {
    const cat = getCat(r.category_id)
    const color = r.type==='income' ? '#16a34a' : r.type==='investment' ? '#2563eb' : '#dc2626'
    return `
      <tr>
        <td>${r.description}</td>
        <td><span style="background:${cat?.color||'#ccc'}20;color:${cat?.color||'#666'};padding:2px 6px;border-radius:4px;font-size:11px">${cat?.name||'—'}</span></td>
        <td>${r.frequency === 'monthly' ? 'Mensal' : r.frequency}</td>
        <td style="text-align:right;color:${color};font-weight:600">${fmt(r.amount)}</td>
      </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Relatório Financeiro — ${monthName}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;padding:32px;font-size:13px}
    h1{font-size:24px;font-weight:700;color:#1a1a2e}
    h2{font-size:15px;font-weight:600;color:#1a1a2e;margin:28px 0 12px;padding-bottom:6px;border-bottom:2px solid #4f6ef7}
    h3{font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #f0f0f0}
    .logo{font-size:28px;margin-bottom:4px}
    .period{font-size:13px;color:#64748b;margin-top:4px}
    .meta{text-align:right;font-size:12px;color:#94a3b8}
    .cards{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:8px}
    .card{background:#f8f9fb;border-radius:10px;padding:14px;border:1px solid #f0f0f0}
    .card-label{font-size:11px;color:#64748b;margin-bottom:4px}
    .card-value{font-size:20px;font-weight:700}
    .g{color:#16a34a}.r{color:#dc2626}.b{color:#2563eb}.p{color:#4f6ef7}
    table{width:100%;border-collapse:collapse}
    th{font-size:11px;font-weight:600;color:#64748b;padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:left}
    td{padding:7px 8px;border-bottom:1px solid #fafafa;font-size:12px;color:#374151}
    tr:last-child td{border-bottom:none}
    .badge{background:#eef0ff;color:#4f6ef7;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #f0f0f0;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between}
    @media print{body{padding:16px}.header{margin-bottom:16px}}
  </style></head><body>
  <div class="header">
    <div>
      <div class="logo">💰</div>
      <h1>FinanceOS</h1>
      <div class="period">Relatório financeiro — ${monthName}</div>
    </div>
    <div class="meta">
      <div>${user?.name || 'Usuário'}</div>
      <div>${user?.email || ''}</div>
      <div>Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
    </div>
  </div>

  <h2>Resumo do período</h2>
  <div class="cards">
    <div class="card"><div class="card-label">Receitas</div><div class="card-value g">${fmt(income)}</div></div>
    <div class="card"><div class="card-label">Despesas</div><div class="card-value r">${fmt(expense)}</div></div>
    <div class="card"><div class="card-label">Investimentos</div><div class="card-value b">${fmt(invest)}</div></div>
    <div class="card"><div class="card-label">Saldo do período</div><div class="card-value ${balance>=0?'g':'r'}">${fmt(balance)}</div></div>
  </div>

  ${catRows ? `<h2>Despesas por categoria</h2>
  <table><thead><tr><th>Categoria</th><th style="text-align:right">Valor</th><th style="text-align:right">%</th><th>Distribuição</th></tr></thead>
  <tbody>${catRows}</tbody></table>` : ''}

  ${txRows ? `<h2>Todos os lançamentos</h2>
  <table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
  <tbody>${txRows}</tbody></table>` : ''}

  ${goalRows ? `<h2>Metas financeiras</h2>
  <table><thead><tr><th>Meta</th><th style="text-align:right">Acumulado</th><th style="text-align:right">Objetivo</th><th style="text-align:right">Progresso</th><th>Barra</th></tr></thead>
  <tbody>${goalRows}</tbody></table>` : ''}

  ${recRows ? `<h2>Despesas recorrentes</h2>
  <table><thead><tr><th>Descrição</th><th>Categoria</th><th>Frequência</th><th style="text-align:right">Valor</th></tr></thead>
  <tbody>${recRows}</tbody></table>` : ''}

  <div class="footer">
    <span>FinanceOS — Gestão financeira híbrida</span>
    <span>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</span>
  </div>
  <script>window.onload=()=>window.print()</script>
  </body></html>`

  const w = window.open('','_blank')
  w.document.write(html)
  w.document.close()
}
