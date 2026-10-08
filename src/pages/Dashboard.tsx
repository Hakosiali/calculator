import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Briefcase,
  ListChecks,
  Wallet,
  FileText,
  Receipt,
  CalendarClock,
  ArrowUpRight,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'
import {
  getClients,
  getMissions,
  getTasks,
  getInvoices,
  getDocuments,
  getCalendarEvents,
} from '../lib/dataClient'
import { invoiceTotal } from '../lib/invoice'
import { formatCurrencyDZD, formatDate } from '../lib/format'
import { missionStatusStyles } from '../lib/badges'

const MISSION_COLORS: Record<string, string> = {
  Planifiée: '#0ea5e9',
  'En cours': '#6366f1',
  'En pause': '#f59e0b',
  Terminée: '#10b981',
  Annulée: '#f43f5e',
}

export function Dashboard() {
  const clients = getClients()
  const missions = getMissions()
  const tasks = getTasks()
  const invoices = getInvoices()
  const documents = getDocuments()
  const events = getCalendarEvents()

  const activeClients = clients.filter((c) => c.status === 'actif').length
  const ongoingMissions = missions.filter((m) => m.status === 'En cours').length
  const pendingTasks = tasks.filter((t) => t.status !== 'Terminé').length
  const revenueCollected = invoices
    .filter((i) => i.status === 'Payée')
    .reduce((sum, i) => sum + invoiceTotal(i), 0)
  const revenueOutstanding = invoices
    .filter((i) => i.status === 'En attente' || i.status === 'En retard')
    .reduce((sum, i) => sum + invoiceTotal(i), 0)

  const missionsByStatus = useMemo(() => {
    const order: (keyof typeof MISSION_COLORS)[] = ['En cours', 'Planifiée', 'En pause', 'Terminée', 'Annulée']
    return order
      .map((status) => ({
        name: status,
        value: missions.filter((m) => m.status === status).length,
      }))
      .filter((d) => d.value > 0)
  }, [missions])

  const revenueByMonth = useMemo(() => {
    const months: { key: string; label: string }[] = []
    const base = new Date(2026, 9, 1) // October 2026
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(d),
      })
    }
    return months.map(({ key, label }) => {
      const total = invoices
        .filter((inv) => inv.issueDate.startsWith(key) && inv.status !== 'Annulée')
        .reduce((sum, inv) => sum + invoiceTotal(inv), 0)
      return { label, total: Math.round(total / 1000) }
    })
  }, [invoices])

  const recentActivity = useMemo(() => {
    type Item = { id: string; date: string; title: string; subtitle: string; icon: typeof FileText }
    const fromDocs: Item[] = documents.map((d) => ({
      id: `doc-${d.id}`,
      date: d.uploadedDate,
      title: `Document ajouté : ${d.name}`,
      subtitle: `par ${d.uploadedBy}`,
      icon: FileText,
    }))
    const fromInvoices: Item[] = invoices.map((i) => ({
      id: `inv-${i.id}`,
      date: i.issueDate,
      title: `Facture ${i.number} émise`,
      subtitle: clients.find((c) => c.id === i.clientId)?.name ?? '',
      icon: Receipt,
    }))
    return [...fromDocs, ...fromInvoices].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  }, [documents, invoices, clients])

  const upcomingDeadlines = useMemo(() => {
    const today = '2026-10-06'
    return events
      .filter((e) => e.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 6)
  }, [events])

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité HRCC - 6 octobre 2026"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clients actifs" value={String(activeClients)} icon={Users} accent="bg-indigo-50 text-indigo-600" trend={{ value: `${clients.length} clients au total`, positive: true }} />
        <StatCard label="Missions en cours" value={String(ongoingMissions)} icon={Briefcase} accent="bg-sky-50 text-sky-600" trend={{ value: `${missions.length} missions au total`, positive: true }} />
        <StatCard label="Tâches en attente" value={String(pendingTasks)} icon={ListChecks} accent="bg-amber-50 text-amber-600" trend={{ value: `${tasks.length} tâches au total`, positive: pendingTasks < tasks.length / 2 }} />
        <StatCard label="Revenu encaissé" value={formatCurrencyDZD(revenueCollected)} icon={Wallet} accent="bg-emerald-50 text-emerald-600" trend={{ value: `${formatCurrencyDZD(revenueOutstanding)} en attente`, positive: false }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Facturation (en milliers de DA)</h2>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(value) => [`${value} K DA`, 'Facturé']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Missions par statut</h2>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={missionsByStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {missionsByStatus.map((entry) => (
                    <Cell key={entry.name} fill={MISSION_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {missionsByStatus.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MISSION_COLORS[entry.name] }} />
                  {entry.name}
                </span>
                <span className="font-medium text-slate-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Activité récente</h2>
          <ul className="mt-4 space-y-4">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.subtitle} · {formatDate(item.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Échéances à venir</h2>
            <Link to="/calendar" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Voir le calendrier <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {upcomingDeadlines.map((event) => (
              <li key={event.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{event.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(event.date)} · {event.time !== '00:00' ? event.time : 'Journée'}</p>
                </div>
                <Badge className="bg-slate-100 text-slate-600 ring-slate-500/20">{event.type}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Missions prioritaires en cours</h2>
          <Link to="/missions" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
            Voir toutes les missions <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-medium">Mission</th>
                <th className="pb-2 font-medium">Client</th>
                <th className="pb-2 font-medium">Statut</th>
                <th className="pb-2 font-medium">Avancement</th>
                <th className="pb-2 font-medium">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missions
                .filter((m) => m.status === 'En cours' && (m.priority === 'Haute' || m.priority === 'Urgente'))
                .slice(0, 5)
                .map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <Link to={`/missions/${m.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                        {m.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{clients.find((c) => c.id === m.clientId)?.name}</td>
                    <td className="py-3 pr-4">
                      <Badge className={missionStatusStyles[m.status]}>{m.status}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${m.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{m.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{formatDate(m.endDate)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
