import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ListChecks,
  FolderOpen,
  Receipt,
  CalendarDays,
  Sparkles,
  X,
  Database,
  HardDrive,
  LogOut,
} from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/AuthProvider'

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/missions', label: 'Missions', icon: Briefcase },
  { to: '/tasks', label: 'Tâches', icon: ListChecks },
  { to: '/documents', label: 'Documents', icon: FolderOpen },
  { to: '/invoices', label: 'Factures', icon: Receipt },
  { to: '/calendar', label: 'Calendrier', icon: CalendarDays },
  { to: '/assistant', label: 'Assistant IA', icon: Sparkles },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const emailInitials = isSupabaseConfigured && user?.email ? user.email.slice(0, 2).toUpperCase() : 'AB'

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              HR
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">HRCC</p>
              <p className="text-[11px] text-slate-500">Conseil RH</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              {emailInitials}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              {isSupabaseConfigured ? (
                <p className="truncate text-sm font-semibold text-slate-800">{user?.email}</p>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-slate-800">Amina Belkacemi</p>
                  <p className="truncate text-xs text-slate-500">Directrice Conseil RH</p>
                </>
              )}
            </div>
            {isSupabaseConfigured && (
              <button
                onClick={handleSignOut}
                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          <div
            className={`mt-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium ${
              isSupabaseConfigured ? 'text-emerald-700' : 'text-slate-500'
            }`}
            title={
              isSupabaseConfigured
                ? 'Connecté à Supabase : les données sont lues depuis votre base.'
                : "Mode démo : données d'exemple locales. Voir SETUP.md pour connecter Supabase."
            }
          >
            {isSupabaseConfigured ? <Database className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
            {isSupabaseConfigured ? 'Données : Supabase' : 'Données : démo (locale)'}
          </div>
        </div>
      </aside>
    </>
  )
}
