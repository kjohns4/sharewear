import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Home from '@/pages/Home'
import Event from '@/pages/Event'
import Login from '@/pages/Login'
import SetDisplayName from '@/pages/SetDisplayName'
import type { Profile } from '@/lib/database.types'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      return
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [user])

  if (loading || profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public event feed — anyone with the link can view */}
      <Route path="/event/:inviteCode" element={<Event />} />

      {/* Auth */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* First-login flow: user exists but has no display_name */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : !profile?.display_name ? (
            <SetDisplayName />
          ) : (
            <Home />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
