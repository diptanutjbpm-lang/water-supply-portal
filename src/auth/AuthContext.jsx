import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { apiRequest } from '../api/api'

const AuthContext = createContext(null)

const TOKEN_KEY = 'tjb_session_token'
const USER_KEY = 'tjb_session_user'

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY))

  const login = useCallback(async (mobile, password) => {
    const result = await apiRequest('login', { mobile, password })

    if (!result.success) {
      throw new Error(result.message || 'Login failed.')
    }

    sessionStorage.setItem(TOKEN_KEY, result.token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(result.user))
    setToken(result.token)
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) await apiRequest('logout', { token })
    } catch {
      // Local logout must still work if the network is unavailable.
    }

    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [token])

  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated: Boolean(user && token) }),
    [user, token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
