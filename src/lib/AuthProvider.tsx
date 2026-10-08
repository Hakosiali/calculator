import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from './supabaseClient'

export interface AppUser {
  id: string
  email: string | null
}

interface AuthState {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

// Demo mode (no Supabase project configured) never shows a login screen —
// the public GitHub Pages demo and local `npm run dev` with no .env.local
// stay fully open, same as every other feature in the app. This is the
// user the rest of the UI (the sidebar footer, mainly) sees in that case.
const DEMO_USER: AppUser = { id: 'demo-user', email: 'amina.belkacemi@hrcc.dz' }

// supabase-js's auth error messages are English and vary in wording by
// SDK version; the rest of this app is entirely French, so translate the
// ones a user can actually hit here instead of leaking raw English text.
function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.'
  if (m.includes('email not confirmed')) return "Cette adresse e-mail n'a pas encore été confirmée."
  if (m.includes('failed to fetch') || m.includes('network')) {
    return 'Impossible de joindre Supabase. Vérifiez votre connexion et réessayez.'
  }
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(isSupabaseConfigured ? null : DEMO_USER)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const sessionUser = data.session?.user
        setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    if (!supabase) return { error: 'Supabase n\'est pas configuré (voir SETUP.md).' }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? translateAuthError(error.message) : null }
    } catch {
      return { error: 'Impossible de joindre Supabase. Vérifiez votre connexion et réessayez.' }
    }
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
