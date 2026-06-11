import { useState, useEffect, useRef, useCallback } from 'react'
import { getMeetings, getTasks, getAssignedTasks, completeItem } from '../services/scheduleService'
import { useUser } from '../context/UserContext'
import { playNotificationSound } from '../utils/notificationSound'

const WINDOW_BEFORE_MINS = 2
const WINDOW_AFTER_MINS  = 30
const CHECK_INTERVAL_MS  = 60_000

export function useScheduleAlerts() {
  const { userId, role } = useUser()
  const [queue, setQueue] = useState([])
  const alertedIds = useRef(new Set())

  const check = useCallback(async () => {
    if (!userId) return
    try {
      const fetches = [getMeetings(userId), getTasks(userId)]
      if (role === 'member') fetches.push(getAssignedTasks(userId))
      const [meetings, ownTasks, assignedTasks = []] = await Promise.all(fetches)

      const items = [
        ...meetings.map(m => ({
          ...m,
          _type:  'meeting',
          _time:  m.scheduled_at,
          title:  (m.assigned_to_user_id && m.assigned_to_user_id === userId && m.owner_name)
                    ? `Meeting with ${m.owner_name}`
                    : m.title,
        })),

        // Owner's own tasks — tag delegated ones so popup can phrase it correctly
        ...ownTasks.map(t => ({
          ...t,
          _type:               'task',
          _time:               t.due_at,
          _alertKey:           `own_${t.id}`,
          _assigned_to_member: !!t.assigned_to_user_id,
          _member_name:        t.assigned_to_name || null,
        })),

        // Member's assigned tasks (separate from their own tasks)
        ...assignedTasks.map(t => ({
          ...t,
          _type:              'task',
          _time:              t.due_at,
          _alertKey:          `assigned_${t.id}`,
          _assigned_by_owner: true,
          _owner_name:        t.owner_name || 'your manager',
        })),
      ]

      const now = Date.now()
      items.forEach(item => {
        const baseKey = item._alertKey || `${item._type}_${item.id}`
        if (!item._time) return

        const diffMins = (now - new Date(item._time).getTime()) / 60_000
        if (diffMins >= -WINDOW_BEFORE_MINS && diffMins <= WINDOW_AFTER_MINS) {
          const isPast = diffMins >= 0
          // Meetings fire twice: once upcoming (-2→0 min) and once post-meeting (0→30 min)
          // Tasks use a single key (existing behaviour)
          const alertKey = item._type === 'meeting'
            ? `${baseKey}_${isPast ? 'past' : 'upcoming'}`
            : baseKey
          if (alertedIds.current.has(alertKey)) return
          alertedIds.current.add(alertKey)
          playNotificationSound()
          setQueue(prev => [...prev, { ...item, _alertKey: alertKey, _isPast: isPast }])
        }
      })
    } catch {}
  }, [userId, role])

  useEffect(() => {
    check()
    const t = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(t)
  }, [check])

  const dismiss = useCallback((alertKey) => {
    setQueue(prev => prev.filter(a => a._alertKey !== alertKey))
  }, [])

  const complete = useCallback(async (item) => {
    try { await completeItem(userId, item.id) } catch {}
    dismiss(item._alertKey)
    window.dispatchEvent(new CustomEvent('pea:refresh-schedule'))
    window.dispatchEvent(new CustomEvent('pea:refresh-context'))
  }, [userId, dismiss])

  return { queue, dismiss, complete }
}
