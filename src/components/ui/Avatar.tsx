import { initials } from '../../lib/format'

const PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
]

function colorFor(name: string) {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETTE[sum % PALETTE.length]
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md'
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const dims = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-sm'
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${dims} ${colorFor(name)}`}
      title={name}
    >
      {initials(name)}
    </div>
  )
}
