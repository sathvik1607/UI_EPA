import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { registerOwner, registerMember, getTeams } from '../../services/userService'
import styles from './UserSetup.module.css'

export default function UserSetup({ loginMode = false }) {
  const [tab, setTab]         = useState('owner')
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [slowHint, setSlowHint] = useState(false)
  const hintTimer               = useRef(null)
  const { loginWithData, login } = useUser()
  const navigate                 = useNavigate()

  // Owner form
  const [ownerName,    setOwnerName]    = useState('')
  const [companyName,  setCompanyName]  = useState('')
  const [ownerPwd,     setOwnerPwd]     = useState('')

  // Member form
  const [memberName,   setMemberName]   = useState('')
  const [memberPwd,    setMemberPwd]    = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    if (tab === 'member') {
      getTeams().then(setTeams).catch(() => {})
    }
  }, [tab])

  useEffect(() => {
    if (loading) {
      hintTimer.current = setTimeout(() => setSlowHint(true), 4000)
    } else {
      clearTimeout(hintTimer.current)
      setSlowHint(false)
    }
    return () => clearTimeout(hintTimer.current)
  }, [loading])

  const handleOwnerSubmit = async (e) => {
    e.preventDefault()
    if (!ownerName.trim())   { setError('Name is required');         return }
    if (!companyName.trim()) { setError('Company name is required'); return }
    if (!ownerPwd)           { setError('Password is required');     return }
    setLoading(true)
    setError('')
    try {
      const data = await registerOwner(ownerName.trim(), companyName.trim(), ownerPwd)
      loginWithData(data)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(detail || err.message || 'Registration failed.')
      setLoading(false)
    }
  }

  const handleMemberSubmit = async (e) => {
    e.preventDefault()
    if (!memberName.trim()) { setError('Name is required');           return }
    if (!selectedTeam)      { setError('Please select a company');    return }
    if (!memberPwd)         { setError('Password is required');       return }
    setLoading(true)
    setError('')
    try {
      const data = await registerMember(memberName.trim(), Number(selectedTeam), memberPwd)
      loginWithData(data)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(detail || err.message || 'Registration failed.')
      setLoading(false)
    }
  }

  const [loginName, setLoginName] = useState('')
  const [loginPwd,  setLoginPwd]  = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginName.trim()) { setError('Username is required'); return }
    if (!loginPwd)         { setError('Password is required'); return }
    setLoading(true)
    setError('')
    try {
      await login(loginName.trim(), loginPwd)
    } catch (err) {
      setError(err.message || 'Could not sign in.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.logo}>P</div>
        <h1 className={styles.title}>Welcome to PEA</h1>
        <p className={styles.subtitle}>Your Personal Executive Assistant.</p>

        {!loginMode ? (
          <>
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${tab === 'owner' ? styles.tabActive : ''}`}
                onClick={() => { setTab('owner'); setError('') }}
                disabled={loading}
              >
                Create a Company
              </button>
              <button
                type="button"
                className={`${styles.tab} ${tab === 'member' ? styles.tabActive : ''}`}
                onClick={() => { setTab('member'); setError('') }}
                disabled={loading}
              >
                Join a Company
              </button>
            </div>

            {tab === 'owner' ? (
              <form className={styles.form} onSubmit={handleOwnerSubmit} noValidate>
                <label className={styles.label}>Your Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Subhash"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
                <label className={styles.label}>Company Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="ABC Logistics"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  disabled={loading}
                />
                <label className={styles.label}>Password</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={ownerPwd}
                  onChange={e => setOwnerPwd(e.target.value)}
                  disabled={loading}
                />
                {error && <p className={styles.error}>{error}</p>}
                {slowHint && <p className={styles.hint}>Waking up server, please wait…</p>}
                <button type="submit" className={styles.btn} disabled={loading}>
                  {loading ? 'Creating…' : 'Register as Owner →'}
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleMemberSubmit} noValidate>
                <label className={styles.label}>Your Name</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Siva"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
                <label className={styles.label}>Password</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  value={memberPwd}
                  onChange={e => setMemberPwd(e.target.value)}
                  disabled={loading}
                />
                <label className={styles.label}>Company</label>
                <select
                  className={styles.select}
                  value={selectedTeam}
                  onChange={e => setSelectedTeam(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select a company…</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {error && <p className={styles.error}>{error}</p>}
                {slowHint && <p className={styles.hint}>Waking up server, please wait…</p>}
                <button type="submit" className={styles.btn} disabled={loading}>
                  {loading ? 'Joining…' : 'Join Company →'}
                </button>
              </form>
            )}

            <p className={styles.note}>
              Already have an account?{' '}
              <button type="button" className={styles.linkBtn} onClick={() => { setError(''); navigate('/login') }}>
                Sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <form className={styles.form} onSubmit={handleLogin} noValidate>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                placeholder="sathvik"
                value={loginName}
                onChange={e => setLoginName(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={loginPwd}
                onChange={e => setLoginPwd(e.target.value)}
                disabled={loading}
              />
              {error && <p className={styles.error}>{error}</p>}
              {slowHint && <p className={styles.hint}>Waking up server, please wait…</p>}
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
            <p className={styles.note}>
              <button type="button" className={styles.linkBtn} onClick={() => { setError(''); navigate('/register') }}>
                ← Back to registration
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
