import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMeetings, getTasks, getAssignedTasks } from '../services/scheduleService'
import { useUser } from './UserContext'

const ScheduleContext = createContext(null)

export function useSchedule() {
  return useContext(ScheduleContext)
}

export function ScheduleProvider({ children }) {
  const { userId, user } = useUser()
  const role = user?.role
  const [meetings,       setMeetings]       = useState([])
  const [tasks,          setTasks]          = useState([])
  const [assignedTasks,  setAssignedTasks]  = useState([])
  const [loaded,         setLoaded]         = useState(false)
  const [error,          setError]          = useState(null)

  const refresh = useCallback(() => {
    if (!userId) return
    setError(null)
    const fetches = [getMeetings(userId), getTasks(userId)]
    if (role === 'member') fetches.push(getAssignedTasks(userId))
    Promise.all(fetches)
      .then(([m, t, a]) => {
        setMeetings(m ?? [])
        setTasks(t ?? [])
        setAssignedTasks(a ?? [])
        setLoaded(true)
      })
      .catch(err => { setError(err.message || 'Could not load schedule'); setLoaded(true) })
  }, [userId, role])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    window.addEventListener('pea:refresh-schedule', refresh)
    return () => window.removeEventListener('pea:refresh-schedule', refresh)
  }, [refresh])

  const todayMeetings = meetings.filter(m => m.is_today)

  return (
    <ScheduleContext.Provider value={{ meetings, tasks, assignedTasks, todayMeetings, loaded, error, refresh }}>
      {children}
    </ScheduleContext.Provider>
  )
}
