import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Home } from '@/pages/Home'
import { Dashboard } from '@/pages/Dashboard'
import type { User } from '@supabase/supabase-js'

export function App() {
  const { user, loading } = useAuth()
  const [loginUrl, setLoginUrl] = useState<string | null>(null)

  useEffect(() => {
    const getLoginUrl = async () => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        })
        if (data?.url) {
          setLoginUrl(data.url)
        }
      } catch (err) {
        console.error('Failed to get login URL:', err)
      }
    }

    if (!user && !loading) {
      getLoginUrl()
    }
  }, [user, loading])

  const handleLogin = () => {
    if (loginUrl) {
      window.location.href = loginUrl
    }
  }

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
    return <Home onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}

export default App
