import { useState } from 'react'
import { useScheduleAlerts } from '../../hooks/useScheduleAlerts'
import styles from './ScheduleAlertPopup.module.css'

export default function ScheduleAlertPopup() {
  const { queue, dismiss, complete } = useScheduleAlerts()
  const [busy, setBusy] = useState(false)

  if (queue.length === 0) return null

  const item      = queue[0]
  const isMeeting = item._type === 'meeting'
  const verb      = isMeeting ? 'attend' : 'complete'
  const icon      = isMeeting ? '📅' : '✅'

  const handleComplete = async () => {
    setBusy(true)
    await complete(item)
    setBusy(false)
  }

  const handleDismiss = () => dismiss(item.id)

  return (
    <div className={styles.popup} role="alertdialog" aria-live="assertive">
      <div className={styles.topRow}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.type}>{isMeeting ? 'Meeting' : 'Task'}</span>
        {queue.length > 1 && (
          <span className={styles.more}>+{queue.length - 1} more</span>
        )}
      </div>

      <p className={styles.question}>
        Did you {verb} this {isMeeting ? 'meeting' : 'task'}?
      </p>
      <p className={styles.title}>{item.title}</p>

      {(item.scheduled_at || item.due_at) && (
        <p className={styles.time}>
          {fmtTime(item.scheduled_at || item.due_at)}
        </p>
      )}

      <div className={styles.actions}>
        <button
          className={styles.yesBtn}
          onClick={handleComplete}
          disabled={busy}
        >
          {busy ? 'Marking…' : 'Yes, done!'}
        </button>
        <button
          className={styles.noBtn}
          onClick={handleDismiss}
          disabled={busy}
        >
          Not yet
        </button>
      </div>
    </div>
  )
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', weekday: 'short',
    })
  } catch { return '' }
}
