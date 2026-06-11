import { useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { useSchedule } from '../../context/ScheduleContext'
import { useNotifications } from '../../context/NotificationContext'
import styles from './Sidebar.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(str) {
  if (!str) return ''
  try {
    return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  return !isNaN(d) && d.toDateString() === new Date().toDateString()
}

function minutesUntil(dateStr) {
  return (new Date(dateStr) - Date.now()) / 60_000
}

function urgencyClass(dateStr) {
  const m = minutesUntil(dateStr)
  if (m < -5)  return 'past'
  if (m <= 15) return 'now'
  if (m <= 30) return 'urgent'
  return ''
}

// ── Today's Schedule panel ────────────────────────────────────────────────────

function TodayPanel() {
  const { todayMeetings, loaded } = useSchedule()
  const { userId } = useUser()

  const today = [...todayMeetings]
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5)

  function displayTitle(e) {
    if (e.assigned_to_user_id && e.assigned_to_user_id === userId && e.owner_name) {
      return `Meeting with ${e.owner_name}`
    }
    return e.title || 'Untitled'
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <CalIcon />
        <span>Today</span>
        {loaded && today.length > 0 && (
          <span className={styles.badge}>{today.length}</span>
        )}
      </div>

      {!loaded ? (
        <div className={styles.skeleton}>
          <div className={styles.skRow} />
          <div className={styles.skRow} style={{ width: '75%' }} />
        </div>
      ) : today.length === 0 ? (
        <p className={styles.emptyMsg}>No events today</p>
      ) : (
        <ul className={styles.eventList}>
          {today.map((e, i) => {
            const urg = urgencyClass(e.scheduled_at)
            return (
              <li
                key={e.id || i}
                className={`${styles.eventItem} ${urg ? styles[`urg_${urg}`] : ''}`}
              >
                <span className={styles.eventTime}>{e.time || fmtTime(e.scheduled_at)}</span>
                <span className={styles.eventTitle}>{displayTitle(e)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}


// ── Secondary nav links ───────────────────────────────────────────────────────

const NAV = [
  { to: '/assistant',     label: 'Chat',          icon: <ChatIcon /> },
  { to: '/schedule',      label: 'Schedule',      icon: <CalPlusIcon /> },
  { to: '/requests',      label: 'Requests',      icon: <RequestsIcon /> },
  { to: '/notifications', label: 'Notifications', icon: <BellIcon /> },
  { to: '/context',       label: 'Memory',        icon: <BrainIcon /> },
]

// ── Delete Session confirmation ───────────────────────────────────────────────

function DeleteSessionButton() {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = useCallback(() => {
    // Dispatch a custom event — Assistant.jsx is listening
    window.dispatchEvent(new CustomEvent('pea:delete-session'))
    setConfirming(false)
  }, [])

  if (confirming) {
    return (
      <div className={styles.deleteConfirm}>
        <p className={styles.deleteQuestion}>Delete this session?</p>
        <p className={styles.deleteHint}>All messages will be cleared.</p>
        <div className={styles.deleteActions}>
          <button className={styles.deleteCancelBtn} onClick={() => setConfirming(false)}>
            Cancel
          </button>
          <button className={styles.deleteConfirmBtn} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      className={styles.deleteBtn}
      onClick={() => setConfirming(true)}
      title="Delete this chat session"
    >
      <TrashIcon />
      <span>Delete Session</span>
    </button>
  )
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, logout } = useUser()
  const { unreadCount }  = useNotifications()
  const displayName = user?.name ?? 'User'
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logo}>P</div>
        <div>
          <div className={styles.brandName}>PEA</div>
          <div className={styles.brandSub}>Executive Assistant</div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className={styles.content}>
        <TodayPanel />

        {/* Divider + secondary nav */}
        <div className={styles.divider} />
        <nav className={styles.nav}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
              {item.to === '/notifications' && unreadCount > 0 && (
                <span className={styles.navBadge}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Delete Session — sits above the footer */}
      <div className={styles.deleteZone}>
        <DeleteSessionButton />
      </div>

      {/* Footer — user info + logout */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <span className={styles.userName}>{displayName}</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Sign out">
          <LogoutIcon />
        </button>
      </div>
    </aside>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CalIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function ChatIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function CalPlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
}
function BrainIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}
function RequestsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
