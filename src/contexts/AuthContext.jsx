import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, PERMISSIONS } from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const current = auth.getCurrentUser()
    setUser(current)
    setLoading(false)
  }, [])

  const signIn = useCallback(async (email, password) => {
    const result = await auth.signIn(email, password)
    if (result.user) setUser(result.user)
    return result
  }, [])

  const signUp = useCallback(async (name, email, password) => {
    const result = await auth.signUp(name, email, password)
    if (result.user) setUser(result.user)
    return result
  }, [])

  const signOut = useCallback(async () => {
    await auth.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    if (!user) return { error: 'Não autenticado.' }
    const result = await auth.updateProfile(user.id, updates)
    if (result.user) setUser(result.user)
    return result
  }, [user])

  const changePassword = useCallback(async (current, next) => {
    if (!user) return { error: 'Não autenticado.' }
    return auth.changePassword(user.id, current, next)
  }, [user])

  const can = useCallback((permission) => {
    return auth.can(user, permission)
  }, [user])

  const permissions = user ? (PERMISSIONS[user.role] ?? {}) : {}

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile, changePassword, can, permissions }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
