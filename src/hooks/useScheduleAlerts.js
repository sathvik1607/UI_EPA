import { useState, useEffect, useRef, useCallback } from 'react'
import { getMeetings, getTasks, completeItem } from '../services/scheduleService'
import { useUser } from '../context/UserContext'

const WINDOW_BEFORE_MINS = 2
const WINDOW_AFTER_MINS  = 30
const CHECK_INTERVAL_MS  = 60_000

export function useScheduleAlerts() {
  const { userId } = useUser()
  const [queue, setQueue] = useState([])
  const alertedIds = useRef(new Set())

  const check = useCallback(async () => {
    if (!userId) return
    try {
      const [meetings, tasks] = await Promise.all([getMeetings(userId), getTasks(userId)])
      const items = [
        ...meetings.map(m => ({ ...m, _type: 'meeting', _time: m.scheduled_at })),
        ...tasks.map(t   => ({ ...t, _type: 'task',    _time: t.due_at })),
      ]
      const now = Date.now()

      items.forEach(item => {
        if (alertedIds.current.has(item.id)) return
        if (!item._time) return

        const diffMins = (now - new Date(item._time).getTime()) / 60_000
        if (diffMins >= -WINDOW_BEFORE_MINS && diffMins <= WINDOW_AFTER_MINS) {
          alertedIds.current.add(item.id)
          setQueue(prev => [...prev, item])
        }
      })
    } catch {}
  }, [userId])

  useEffect(() => {
    check()
    const t = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(t)
  }, [check])

  const dismiss = useCallback((itemId) => {
    setQueue(prev => prev.filter(a => a.id !== itemId))
  }, [])

  const complete = useCallback(async (item) => {
    try { await completeItem(userId, item.id) } catch {}
    dismiss(item.id)
    window.dispatchEvent(new CustomEvent('pea:refresh-schedule'))
    window.dispatchEvent(new CustomEvent('pea:refresh-context'))
  }, [userId, dismiss])

  return { queue, dismiss, complete }
}
