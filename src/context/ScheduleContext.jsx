import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMeetings, getTasks } from '../services/scheduleService'
import { useUser } from './UserContext'

const ScheduleContext = createContext(null)

export function useSchedule() {
  return useContext(ScheduleContext)
}

export function ScheduleProvider({ children }) {
  const { userId } = useUser()
  const [meetings, setMeetings] = useState([])
  const [tasks,    setTasks]    = useState([])
  const [loaded,   setLoaded]   = useState(false)
  const [error,    setError]    = useState(null)

  const refresh = useCallback(() => {
    if (!userId) return
    setError(null)
    Promise.all([getMeetings(userId), getTasks(userId)])
      .then(([m, t]) => { setMeetings(m ?? []); setTasks(t ?? []); setLoaded(true) })
      .catch(err => { setError(err.message || 'Could not load schedule'); setLoaded(true) })
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    window.addEventListener('pea:refresh-schedule', refresh)
    return () => window.removeEventListener('pea:refresh-schedule', refresh)
  }, [refresh])

  const todayMeetings = meetings.filter(m => m.is_today)

  return (
    <ScheduleContext.Provider value={{ meetings, tasks, todayMeetings, loaded, error, refresh }}>
      {children}
    </ScheduleContext.Provider>
  )
}
