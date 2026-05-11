// Auth System — offline (localStorage) pronto para produção (Supabase)
const SESSION_KEY = 'fos_session'
const USERS_KEY   = 'fos_users'

export const PERMISSIONS = {
  admin:  { canCreate:true,  canEdit:true,  canDelete:true,  canManageUsers:true,  canExport:true,  label:'Administrador', color:'#4f6ef7', icon:'👑' },
  user:   { canCreate:true,  canEdit:true,  canDelete:false, canManageUsers:false, canExport:false, label:'Usuário',       color:'#22c55e', icon:'👤' },
  viewer: { canCreate:false, canEdit:false, canDelete:false, canManageUsers:false, canExport:false, label:'Visualizador',  color:'#9ca3af', icon:'👁' },
}

const delay = ms => new Promise(r => setTimeout(r, ms))

function getUsers() {
  try { const r = localStorage.getItem(USERS_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function saveUsers(u) { try { localStorage.setItem(USERS_KEY, JSON.stringify(u)) } catch {} }

function getSession() {
  try {
    const r = localStorage.getItem(SESSION_KEY)
    if (!r) return null
    const s = JSON.parse(r)
    if (s.exp && Date.now() > s.exp) { localStorage.removeItem(SESSION_KEY); return null }
    return s
  } catch { return null }
}
function writeSession(user) {
  const clean = { ...user, password: undefined }
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ user: clean, exp: Date.now() + 30*24*60*60*1000 })) } catch {}
  return clean
}

export const auth = {
  getCurrentUser() { return getSession()?.user ?? null },

  async signIn(email, password) {
    await delay(350)
    const u = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!u) return { error: 'E-mail ou senha incorretos.' }
    return { user: writeSession(u) }
  },

  async signUp(name, email, password) {
    await delay(450)
    if (!name?.trim() || name.trim().length < 2) return { error: 'Nome precisa ter ao menos 2 caracteres.' }
    if (!email?.includes('@')) return { error: 'E-mail inválido.' }
    if (!password || password.length < 6) return { error: 'Senha precisa ter ao menos 6 caracteres.' }
    const users = getUsers()
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) return { error: 'E-mail já cadastrado.' }
    const avatar = ['😀','😊','🙂','😎','🤓','🧑','👩','👨'][Math.floor(Math.random()*8)]
    const newUser = {
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: users.length === 0 ? 'admin' : 'user', // primeiro usuário vira admin
      avatar,
      createdAt: new Date().toISOString().split('T')[0],
    }
    users.push(newUser); saveUsers(users)
    return { user: writeSession(newUser) }
  },

  async signOut() { try { localStorage.removeItem(SESSION_KEY) } catch {} },

  async updateProfile(userId, updates) {
    await delay(300)
    const users = getUsers()
    const i = users.findIndex(u => u.id === userId)
    if (i === -1) return { error: 'Usuário não encontrado.' }
    users[i] = { ...users[i], ...updates }
    saveUsers(users)
    return { user: writeSession(users[i]) }
  },

  async changePassword(userId, current, next) {
    await delay(350)
    const users = getUsers()
    const u = users.find(u => u.id === userId)
    if (!u) return { error: 'Usuário não encontrado.' }
    if (u.password !== current) return { error: 'Senha atual incorreta.' }
    if (!next || next.length < 6) return { error: 'Nova senha precisa ter ao menos 6 caracteres.' }
    return auth.updateProfile(userId, { password: next })
  },

  async listUsers() {
    await delay(200)
    return getUsers().map(u => ({ ...u, password: undefined }))
  },

  async setUserRole(userId, role) {
    if (!PERMISSIONS[role]) return { error: 'Papel inválido.' }
    return auth.updateProfile(userId, { role })
  },

  async deleteUser(userId) {
    await delay(300)
    saveUsers(getUsers().filter(u => u.id !== userId))
    return { error: null }
  },

  can(user, permission) {
    if (!user) return false
    return PERMISSIONS[user.role]?.[permission] ?? false
  },

  async signInWithGoogle() { return { error: 'Login social requer Supabase online. Configure o .env para usar.' } },
  async signInWithGitHub()  { return { error: 'Login social requer Supabase online. Configure o .env para usar.' } },
}
