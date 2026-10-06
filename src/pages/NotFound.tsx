import { Link } from 'react-router-dom'
import { CompassIcon } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <CompassIcon className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-slate-900">Page introuvable</h1>
      <p className="mt-1 text-sm text-slate-500">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link
        to="/"
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Retour au tableau de bord
      </Link>
    </div>
  )
}
