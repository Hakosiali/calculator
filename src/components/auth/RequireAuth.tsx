import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthProvider'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Demo mode (no Supabase project configured) never gates the app —
  // this keeps the public GitHub Pages demo open to everyone.
  if (!isSupabaseConfigured) return <Outlet />

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
