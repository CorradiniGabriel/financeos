const DB_NAME    = 'FinanceOS'
const DB_VERSION = 1
const STORES     = ['transactions','categories','cost_centers','credit_cards','goals','category_subs']

let _db = null

function openDB() {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = e.target.result
      STORES.forEach(name => { if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath:'id' }) })
    }
    req.onsuccess = e => { _db = e.target.result; resolve(_db) }
    req.onerror   = () => reject(req.error)
  })
}

async function getStore(name, mode='readonly') {
  const db = await openDB()
  return db.transaction(name, mode).objectStore(name)
}

function promisify(req) {
  return new Promise((res,rej) => { req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error) })
}

export const idb = {
  async getAll(store)        { try { return await promisify((await getStore(store)).getAll()) } catch { return [] } },
  async get(store,id)        { try { return await promisify((await getStore(store)).get(id)) } catch { return null } },
  async put(store,item)      { try { return await promisify((await getStore(store,'readwrite')).put(item)) } catch { return null } },
  async delete(store,id)     { try { return await promisify((await getStore(store,'readwrite')).delete(id)) } catch { return null } },
  async putMany(store,items) {
    try {
      const db=await openDB(); const tx=db.transaction(store,'readwrite'); const st=tx.objectStore(store)
      items.forEach(i=>st.put(i))
      return new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=rej})
    } catch { return null }
  },
}

// Verifica se usuário já tem dados (não re-seed)
export async function needsSeed() {
  const existing = await idb.getAll('cost_centers')
  return existing.length === 0
}

// Seed apenas categorias básicas (sem dados fictícios)
export async function seedCleanData(cleanSeed) {
  await idb.putMany('cost_centers', cleanSeed.costCenters)
  await idb.putMany('categories', cleanSeed.categories.map(({ subs, ...c }) => c))
  const allSubs = cleanSeed.categories.flatMap(c => (c.subs||[]).map(s=>({...s,category_id:c.id})))
  if (allSubs.length) await idb.putMany('category_subs', allSubs)
}

export async function loadAllData() {
  const [costCenters, rawCats, subs, creditCards, transactions, goals] = await Promise.all([
    idb.getAll('cost_centers'), idb.getAll('categories'), idb.getAll('category_subs'),
    idb.getAll('credit_cards'), idb.getAll('transactions'), idb.getAll('goals'),
  ])
  const categories = rawCats.map(c=>({...c, subs:subs.filter(s=>s.category_id===c.id)}))
  return { costCenters, categories, creditCards, transactions:transactions.sort((a,b)=>b.date?.localeCompare(a.date)), goals }
}
