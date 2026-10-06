import { NavLink } from 'react-router-dom'
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
} from 'lucide-react'

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
              AB
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-800">Amina Belkacemi</p>
              <p className="truncate text-xs text-slate-500">Directrice Conseil RH</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
