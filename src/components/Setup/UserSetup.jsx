import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import styles from './UserSetup.module.css'

export default function UserSetup() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login }               = useUser()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) { setError('Username is required'); return }
    if (!password)        { setError('Password is required'); return }
    setLoading(true)
    setError('')
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message || 'Could not connect to the backend. Make sure it is running on port 8000.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.logo}>P</div>
        <h1 className={styles.title}>Welcome to PEA</h1>
        <p className={styles.subtitle}>Your Personal Executive Assistant.</p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.label}>Username</label>
          <input
            className={styles.input}
            type="text"
            placeholder="sathvik"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
            disabled={loading}
          />
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <p className={styles.note}>New here? Entering any username will create your account.</p>
      </div>
    </div>
  )
}
