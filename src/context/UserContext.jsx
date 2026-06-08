import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { registerUser, loginUser, checkHealth } from '../services/userService'

const UserContext = createContext(null)

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }) {
  const [user, setUser]                   = useState(null)
  const [loggedIn, setLoggedIn]           = useState(false)
  const [backendOnline, setBackendOnline] = useState(null)
  const [ready, setReady]                 = useState(false)

  useEffect(() => {
    // Never auto-restore — always require login on page load
    setReady(true)
    checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const trimmed = username.trim()
    const email   = `${trimmed.toLowerCase().replace(/\s+/g, '.')}@pea.local`
    let data
    try {
      data = await loginUser(trimmed, password)
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        throw new Error('Incorrect password.')
      }
      // /auth/login not built yet or any other error — fall back to register/get
      data = await registerUser(trimmed, email, password)
    }
    localStorage.setItem('pea_user', JSON.stringify(data))
    setUser(data)
    setLoggedIn(true)
    return data
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setLoggedIn(false)
  }, [])

  return (
    <UserContext.Provider value={{ user, userId: user?.id ?? null, loggedIn, backendOnline, ready, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}
