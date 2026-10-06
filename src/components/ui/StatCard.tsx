import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  accent?: string
}

export function StatCard({ label, value, icon: Icon, trend, accent = 'bg-indigo-50 text-indigo-600' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <p className={`mt-3 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend.value}
        </p>
      )}
    </div>
  )
}
