import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Briefcase, Users } from 'lucide-react'
import { dataClient } from '../../lib/dataClient'
import { useAsyncData } from '../../hooks/useAsyncData'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetched once on mount (not per keystroke) and filtered locally as the
  // user types, same UX as the old synchronous getClients()/getMissions().
  const { data } = useAsyncData(
    () => Promise.all([dataClient.clients.list(), dataClient.missions.list()]),
    [],
  )
  const clients = useMemo(() => data?.[0] ?? [], [data])
  const missions = useMemo(() => data?.[1] ?? [], [data])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const q = query.trim().toLowerCase()
  const clientResults = q ? clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4) : []
  const missionResults = q ? missions.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 4) : []
  const showDropdown = focused && q.length > 0

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div ref={containerRef} className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Rechercher un client, une mission..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            {clientResults.length === 0 && missionResults.length === 0 && (
              <p className="px-4 py-3 text-sm text-slate-500">Aucun résultat pour « {query} »</p>
            )}
            {clientResults.length > 0 && (
              <div className="border-b border-slate-100 py-1">
                <p className="px-4 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Clients</p>
                {clientResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/clients/${c.id}`)
                      setQuery('')
                      setFocused(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            {missionResults.length > 0 && (
              <div className="py-1">
                <p className="px-4 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Missions</p>
                {missionResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      navigate(`/missions/${m.id}`)
                      setQuery('')
                      setFocused(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{m.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
      </button>
    </header>
  )
}
