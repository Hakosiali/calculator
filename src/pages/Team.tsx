import { useState, type FormEvent } from 'react'
import { Plus, Trash2, Users } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { dataClient } from '../lib/dataClient'
import { useAsyncData } from '../hooks/useAsyncData'
import { initials } from '../lib/format'

export function Team() {
  const { data, loading, error, refetch } = useAsyncData(() => dataClient.team.list(), [])
  const team = data ?? []

  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function handleClose() {
    if (submitting) return
    setModalOpen(false)
    setName('')
    setRole('')
    setFormError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !role.trim()) {
      setFormError('Veuillez renseigner le nom et la fonction.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await dataClient.team.create({ name: name.trim(), role: role.trim(), initials: initials(name) })
      refetch()
      handleClose()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string, memberName: string) {
    const confirmed = window.confirm(
      `Retirer ${memberName} de l'équipe ? Les missions, tâches et documents déjà associés à cette personne ne seront pas modifiés.`,
    )
    if (!confirmed) return
    setDeletingId(id)
    setActionError(null)
    try {
      await dataClient.team.remove(id)
      refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Équipe"
        description={loading ? 'Chargement...' : `${team.length} membre${team.length > 1 ? 's' : ''} de l'équipe HRCC`}
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Nouveau membre
          </button>
        }
      />

      <Modal open={modalOpen} onClose={handleClose} title="Nouveau membre" description="Ajouter un membre de l'équipe.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-slate-600">
            Nom complet
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Fonction
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="ex. Consultant Recrutement"
              required
            />
          </label>

          {formError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Ajout...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Impossible de charger l'équipe ({error.message}). Vérifiez votre configuration Supabase dans .env.local.
        </div>
      )}
      {actionError && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{actionError}</div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : team.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Users} title="Aucun membre" description="Ajoutez les consultants de votre équipe pour pouvoir leur assigner des missions et des tâches." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => (
            <div key={member.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <Avatar name={member.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{member.name}</p>
                <p className="truncate text-xs text-slate-500">{member.role}</p>
              </div>
              <button
                onClick={() => handleDelete(member.id, member.name)}
                disabled={deletingId === member.id}
                className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 disabled:opacity-50"
                aria-label={`Retirer ${member.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
