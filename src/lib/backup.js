import { idb, loadAllData } from './storage.js'

const VERSION = '1.0'

// ── EXPORTAR ─────────────────────────────────────────────
export async function exportBackup(user) {
  const data = await loadAllData()

  const backup = {
    version:   VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy: user?.name || 'Usuário',
    user: {
      id:        user?.id,
      name:      user?.name,
      email:     user?.email,
      role:      user?.role,
      avatar:    user?.avatar,
      createdAt: user?.createdAt,
    },
    data: {
      costCenters:  data.costCenters,
      categories:   data.categories,
      creditCards:  data.creditCards,
      transactions: data.transactions,
      goals:        data.goals,
    }
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)

  const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  const name = `FinanceOS_backup_${date}.json`

  const a = document.createElement('a')
  a.href     = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return name
}

// ── IMPORTAR ─────────────────────────────────────────────
export function importBackup(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Nenhum arquivo selecionado.'))
    if (!file.name.endsWith('.json')) return reject(new Error('Selecione um arquivo .json'))

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result)

        if (!backup.data) return reject(new Error('Arquivo inválido — não é um backup do FinanceOS.'))

        const { costCenters=[], categories=[], creditCards=[], transactions=[], goals=[] } = backup.data

        // Limpa dados existentes e restaura
        const stores = ['cost_centers','categories','category_subs','credit_cards','transactions','goals']
        for (const store of stores) {
          const db  = await openStore(store, 'readwrite')
          await new Promise((res, rej) => {
            const req = db.clear()
            req.onsuccess = res
            req.onerror   = rej
          })
        }

        // Restaura centros de custo
        if (costCenters.length)  await idb.putMany('cost_centers',  costCenters)

        // Restaura categorias e subcategorias
        const cats = categories.map(({ subs, ...c }) => c)
        if (cats.length) await idb.putMany('categories', cats)
        const subs = categories.flatMap(c => (c.subs||[]).map(s => ({ ...s, category_id: c.id })))
        if (subs.length) await idb.putMany('category_subs', subs)

        // Restaura o resto
        if (creditCards.length)  await idb.putMany('credit_cards',  creditCards)
        if (transactions.length) await idb.putMany('transactions',  transactions)
        if (goals.length)        await idb.putMany('goals',         goals)

        resolve({
          exportedAt: backup.exportedAt,
          exportedBy: backup.exportedBy,
          counts: {
            transactions: transactions.length,
            categories:   categories.length,
            cards:        creditCards.length,
            goals:        goals.length,
          }
        })
      } catch (err) {
        reject(new Error('Erro ao ler o arquivo: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Erro ao abrir o arquivo.'))
    reader.readAsText(file)
  })
}

async function openStore(name, mode = 'readwrite') {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('FinanceOS', 1)
    req.onsuccess = e => {
      const db = e.target.result
      const tx = db.transaction(name, mode)
      resolve(tx.objectStore(name))
    }
    req.onerror = () => reject(req.error)
  })
}
