import { useState, useEffect, useContext } from 'react'
import { getEvents } from '../../services/calendarService'
import EventCard from '../../components/Calendar/EventCard'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import EmptyState from '../../components/Common/EmptyState'
import { ToastContext } from '../../context/ToastContext'
import styles from './Calendar.module.css'

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { addToast } = useContext(ToastContext)

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => addToast(err.message || 'Failed to load events', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()

  const filtered = events.filter((e) => {
    const title = (e.title || e.summary || '').toLowerCase()
    const matchSearch = !search || title.includes(search.toLowerCase())

    const start = new Date(e.start_time || e.start)
    const matchFilter =
      filter === 'all' ||
      (filter === 'upcoming' && start >= now) ||
      (filter === 'past' && start < now) ||
      (filter === 'today' && start.toDateString() === now.toDateString())

    return matchSearch && matchFilter
  })

  const grouped = groupByDate(filtered)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.subtitle}>{events.length} total events</p>
        </div>
        <div className={styles.countBadge}>{filtered.length}</div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.search}
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <div className={styles.filters}>
          {['all', 'today', 'upcoming', 'past'].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.center}><LoadingSpinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No events found"
          description={
            search
              ? `No events match "${search}"`
              : 'No events in this category yet.'
          }
        />
      ) : (
        <div className={styles.groups}>
          {Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date} className={styles.group}>
              <div className={styles.dateLabel}>
                <span>{formatDateLabel(date)}</span>
                <span className={styles.dateCount}>{dayEvents.length}</span>
              </div>
              <div className={styles.list}>
                {dayEvents.map((e, i) => (
                  <EventCard key={e.id || i} event={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupByDate(events) {
  const groups = {}
  for (const e of events) {
    const d = new Date(e.start_time || e.start)
    const key = isNaN(d) ? 'Unknown' : d.toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  }
  return groups
}

function formatDateLabel(dateStr) {
  if (dateStr === 'Unknown') return 'Unknown Date'
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return '📍 Today'
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return '⏭️ Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
