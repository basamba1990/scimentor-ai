import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { Home } from '@/pages/Home'
import { Dashboard } from '@/pages/Dashboard'
import type { User } from '@supabase/supabase-js'

export function App() {
  const { user, loading } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Home />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
