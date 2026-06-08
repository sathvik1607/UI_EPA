import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout/Layout'
import UserSetup from './components/Setup/UserSetup'
import Assistant from './pages/Assistant/Assistant'
import Schedule from './pages/Schedule/Schedule'
import Context from './pages/Context/Context'
import Calendar from './pages/Calendar/Calendar'
import FreeSlots from './pages/FreeSlots/FreeSlots'
import Dashboard from './pages/Dashboard/Dashboard'

function AppRoutes() {
  const { ready, loggedIn } = useUser()

  if (!ready) return null
  if (!loggedIn) return <UserSetup />

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/assistant" replace />} />
          <Route path="/assistant"  element={<Assistant />} />
          <Route path="/schedule"   element={<Schedule />} />
          <Route path="/context"    element={<Context />} />
          <Route path="/calendar"   element={<Calendar />} />
          <Route path="/free-slots" element={<FreeSlots />} />
          <Route path="/dashboard"  element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </UserProvider>
  )
}
