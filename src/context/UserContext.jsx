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
    const saved = localStorage.getItem('pea_user')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setUser(data)
        setLoggedIn(true)
      } catch { /* corrupted entry — ignore */ }
    }
    setReady(true)
    checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const trimmed = username.trim()
    let data
    try {
      data = await loginUser(trimmed, password)
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) throw new Error('No account found with that name.')
      if (status === 401) throw new Error('Incorrect password.')
      throw new Error('Login failed. Please try again.')
    }
    localStorage.setItem('pea_user', JSON.stringify(data))
    setUser(data)
    setLoggedIn(true)
    return data
  }, [])

  // Used after owner/member registration — sets state from the registration response
  // without a second login call.
  const loginWithData = useCallback((data) => {
    localStorage.setItem('pea_user', JSON.stringify(data))
    setUser(data)
    setLoggedIn(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('pea_user')
    setUser(null)
    setLoggedIn(false)
  }, [])

  return (
    <UserContext.Provider value={{
      user,
      userId:   user?.id   ?? null,
      role:     user?.role ?? null,
      teamId:   user?.team_id ?? null,
      loggedIn,
      backendOnline,
      ready,
      login,
      loginWithData,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  )
}
