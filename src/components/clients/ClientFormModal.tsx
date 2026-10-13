import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import type { Client, ClientStatus } from '../../types'

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: (client: Client) => void
  /** When set, the modal edits this client instead of creating a new one. */
  client?: Client
}

const EMPTY_FORM = {
  name: '',
  sector: '',
  wilaya: '',
  address: '',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
  status: 'prospect' as ClientStatus,
  employeeCount: '',
  notes: '',
}

function formFromClient(client: Client): typeof EMPTY_FORM {
  return {
    name: client.name,
    sector: client.sector,
    wilaya: client.wilaya,
    address: client.address,
    contactName: client.contactName,
    contactRole: client.contactRole,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    status: client.status,
    employeeCount: String(client.employeeCount),
    notes: client.notes,
  }
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100'
const labelClass = 'text-xs font-medium text-slate-600'

export function ClientFormModal({ open, onClose, onSaved, client }: ClientFormModalProps) {
  const isEdit = Boolean(client)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(client ? formFromClient(client) : EMPTY_FORM)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, client?.id])

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.sector.trim() || !form.wilaya.trim() || !form.contactName.trim() || !form.contactEmail.trim()) {
      setError('Veuillez remplir au minimum le nom, le secteur, la wilaya et le contact principal.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.contactEmail.trim())) {
      setError("L'adresse e-mail du contact n'est pas valide.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const fields = {
        name: form.name.trim(),
        sector: form.sector.trim(),
        wilaya: form.wilaya.trim(),
        address: form.address.trim(),
        contactName: form.contactName.trim(),
        contactRole: form.contactRole.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        status: form.status,
        employeeCount: Number(form.employeeCount) || 0,
        notes: form.notes.trim(),
      }
      const saved = client
        ? await dataClient.clients.update({ ...client, ...fields })
        : await dataClient.clients.create({ ...fields, clientSince: new Date().toISOString().slice(0, 10) })
      onSaved(saved)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Modifier le client' : 'Nouveau client'}
      description={isEdit ? 'Mettre à jour les informations de ce client.' : 'Ajouter une entreprise cliente ou prospect.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Nom de l'entreprise
            <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Secteur d'activité
            <input className={inputClass} value={form.sector} onChange={(e) => update('sector', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Wilaya
            <input className={inputClass} value={form.wilaya} onChange={(e) => update('wilaya', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Statut
            <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value as ClientStatus)}>
              <option value="prospect">Prospect</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Adresse</span>
            <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} />
          </label>
          <label className={labelClass}>
            Nom du contact principal
            <input className={inputClass} value={form.contactName} onChange={(e) => update('contactName', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Fonction du contact
            <input className={inputClass} value={form.contactRole} onChange={(e) => update('contactRole', e.target.value)} />
          </label>
          <label className={labelClass}>
            E-mail du contact
            <input type="email" className={inputClass} value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Téléphone du contact
            <input className={inputClass} value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} />
          </label>
          <label className={labelClass}>
            Effectif
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.employeeCount}
              onChange={(e) => update('employeeCount', e.target.value)}
            />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Notes</span>
            <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          </label>
        </div>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

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
            {submitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer le client'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
