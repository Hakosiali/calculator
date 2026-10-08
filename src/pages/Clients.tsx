import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Plus, Users } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { dataClient } from '../lib/dataClient'
import { useAsyncData } from '../hooks/useAsyncData'
import { clientStatusStyles } from '../lib/badges'
import type { ClientStatus } from '../types'

const STATUS_FILTERS: { label: string; value: ClientStatus | 'all' }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Actifs', value: 'actif' },
  { label: 'Prospects', value: 'prospect' },
  { label: 'Inactifs', value: 'inactif' },
]

export function Clients() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')

  const { data, loading, error } = useAsyncData(
    () => Promise.all([dataClient.clients.list(), dataClient.missions.list()]),
    [],
  )
  const clients = data?.[0] ?? []
  const missions = data?.[1] ?? []

  const missionCountByClient = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of missions) counts.set(m.clientId, (counts.get(m.clientId) ?? 0) + 1)
    return counts
  }, [missions])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.wilaya.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [clients, query, statusFilter])

  return (
    <div>
      <PageHeader
        title="Clients"
        description={loading ? 'Chargement...' : `${clients.length} entreprises clientes et prospects`}
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Nouveau client
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher par nom, secteur, wilaya..." className="sm:max-w-xs" />
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === f.value ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Impossible de charger les clients ({error.message}). Vérifiez votre configuration Supabase dans .env.local.
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Users} title="Aucun client trouvé" description="Essayez un autre terme de recherche ou filtre." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client) => {
            const missionCount = missionCountByClient.get(client.id) ?? 0
            return (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 group-hover:text-indigo-700">{client.name}</p>
                      <p className="truncate text-xs text-slate-500">{client.sector}</p>
                    </div>
                  </div>
                  <Badge className={clientStatusStyles[client.status]}>{client.status}</Badge>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {client.wilaya}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>{client.employeeCount} salariés</span>
                  <span>{missionCount} mission{missionCount > 1 ? 's' : ''}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
