export function formatCurrencyDZD(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 0,
  }).format(amount) + ' DA'
}

export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function daysUntil(iso: string): number {
  const target = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}
