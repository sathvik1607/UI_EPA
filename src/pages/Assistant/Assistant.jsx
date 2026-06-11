import { useState, useEffect, useRef, useContext } from 'react'
import { sendMessage } from '../../services/assistantService'
import api from '../../services/api'
import ChatMessage from '../../components/Chat/ChatMessage'
import ChatInput from '../../components/Chat/ChatInput'
import TypingIndicator from '../../components/Chat/TypingIndicator'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useUser } from '../../context/UserContext'
import { ToastContext } from '../../context/ToastContext'
import { playNotificationSound } from '../../utils/notificationSound'
import styles from './Assistant.module.css'

const PROACTIVE_POLL = 2_000  // 2s

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm PEA, your Personal Executive Assistant. I can help you schedule meetings, create tasks, check your schedule, and manage your day. What can I do for you?",
  timestamp: new Date().toISOString(),
  intent: 'greeting',
}

// Intents that require a schedule refresh after response
const SCHEDULE_INTENTS = new Set([
  'create_task', 'create_meeting', 'update_task', 'update_meeting', 'complete_task',
])

// Intents that also require a context refresh
const CONTEXT_INTENTS = new Set(['complete_task'])

export default function Assistant() {
  const { userId, backendOnline } = useUser()
  const [messages, setMessages] = useLocalStorage(`pea_messages_${userId}`, [WELCOME])
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)
  const { addToast }            = useContext(ToastContext)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Delete session event from Sidebar
  useEffect(() => {
    const handler = () => {
      setMessages([{ ...WELCOME, timestamp: new Date().toISOString() }])
    }
    window.addEventListener('pea:delete-session', handler)
    return () => window.removeEventListener('pea:delete-session', handler)
  }, [setMessages])

  // Poll for proactive messages pushed by background events (task completions, update requests, etc.)
  useEffect(() => {
    if (!userId) return
    const fetchProactive = async () => {
      try {
        const { data } = await api.get(`/proactive-chat/${userId}`)
        if (data.messages?.length) {
          const injected = data.messages.map(text => ({
            id:        crypto.randomUUID(),
            role:      'assistant',
            text,
            timestamp: new Date().toISOString(),
            proactive: true,
          }))
          playNotificationSound()
          setMessages(prev => [...prev, ...injected])
          window.dispatchEvent(new CustomEvent('pea:refresh-schedule'))
        }
      } catch { /* ignore */ }
    }
    fetchProactive()
    const id = setInterval(fetchProactive, PROACTIVE_POLL)
    return () => clearInterval(id)
  }, [userId, setMessages])

  const handleSend = async (text) => {
    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await sendMessage(text, userId)

      // Non-null error field — backend understood the intent but action failed
      if (data.error) {
        const friendly = data.error.includes('item not found')
          ? "Couldn't find that item. Try being more specific."
          : 'Something went wrong. Please try again.'
        addToast(friendly, 'error')
      }

      const assistantMsg = {
        id:        crypto.randomUUID(),
        role:      'assistant',
        text:      data.response ?? data.error ?? 'No response received.',
        intent:    data.intent,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])

      // Always refresh schedule — backend intent is always null so the
      // old intent-check never fired. Dashboard listens for this event.
      window.dispatchEvent(new CustomEvent('pea:refresh-schedule'))
    } catch (err) {
      addToast(err.message || 'Failed to reach assistant', 'error')
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: "Sorry, I couldn't reach the server. Please make sure the backend is running.",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const statusLabel = backendOnline === null
    ? 'Connecting…'
    : backendOnline
    ? 'Online · Ready to help'
    : 'Backend offline'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>P</div>
          <div>
            <h1 className={styles.title}>PEA Assistant</h1>
            <div className={styles.statusRow}>
              <span className={`${styles.onlineDot} ${backendOnline === false ? styles.dotOffline : backendOnline === null ? styles.dotChecking : ''}`} />
              <span className={styles.onlineLabel}>{statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.messages}>
        <div className={styles.spacer} />
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  )
}
