import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import { formatCurrencyDZD } from '../../lib/format'
import type { Client, Invoice, InvoiceStatus, Mission } from '../../types'

interface InvoiceFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: (invoice: Invoice) => void
  /** When set, the modal edits this invoice instead of creating a new one. */
  invoice?: Invoice
  /** Create mode only: locks the client field to this client (e.g. from ClientDetail). */
  clientId?: string
}

// "En retard" is never hand-picked - it's computed from the due date
// (see effectiveInvoiceStatus in lib/invoice.ts), so it's deliberately
// left out here.
const STATUSES: InvoiceStatus[] = ['En attente', 'Payée', 'Annulée']

interface ItemForm {
  description: string
  quantity: string
  unitPrice: string
}

const EMPTY_ITEM: ItemForm = { description: '', quantity: '1', unitPrice: '' }

function todayPlusDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function emptyForm(clientId?: string) {
  return {
    clientId: clientId ?? '',
    missionId: '',
    status: 'En attente' as InvoiceStatus,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: todayPlusDays(30),
    items: [{ ...EMPTY_ITEM }] as ItemForm[],
  }
}

function formFromInvoice(invoice: Invoice): ReturnType<typeof emptyForm> {
  return {
    clientId: invoice.clientId,
    missionId: invoice.missionId ?? '',
    // Legacy rows may still have "En retard" stored manually from before
    // this became a computed status; the form falls back to "En attente"
    // since "En retard" is no longer a selectable option.
    status: invoice.status === 'En retard' ? 'En attente' : invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    items: invoice.items.map((it) => ({
      description: it.description,
      quantity: String(it.quantity),
      unitPrice: String(it.unitPrice),
    })),
  }
}

function nextInvoiceNumber(existing: Invoice[]): string {
  const year = new Date().getFullYear()
  const prefix = `HRCC-${year}-`
  const seq = existing.filter((i) => i.number.startsWith(prefix)).length + 1
  return `${prefix}${String(seq).padStart(3, '0')}`
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500'
const labelClass = 'text-xs font-medium text-slate-600'

export function InvoiceFormModal({ open, onClose, onSaved, invoice, clientId }: InvoiceFormModalProps) {
  const isEdit = Boolean(invoice)
  const [form, setForm] = useState(emptyForm(clientId))
  const [clients, setClients] = useState<Client[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(invoice ? formFromInvoice(invoice) : emptyForm(clientId))
    setError(null)
    Promise.all([dataClient.clients.list(), dataClient.missions.list()]).then(([c, m]) => {
      setClients(c)
      setMissions(m)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice?.id, clientId])

  function update<K extends keyof ReturnType<typeof emptyForm>>(key: K, value: ReturnType<typeof emptyForm>[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }))
  }

  function removeItem(index: number) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const missionsForClient = missions.filter((m) => !form.clientId || m.clientId === form.clientId)
  const total = form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0)

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validItems = form.items.filter((it) => it.description.trim())
    if (!form.clientId || validItems.length === 0) {
      setError('Veuillez sélectionner un client et renseigner au moins une ligne de prestation.')
      return
    }
    if (form.dueDate < form.issueDate) {
      setError("La date d'échéance ne peut pas précéder la date d'émission.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const fields = {
        clientId: form.clientId,
        missionId: form.missionId || null,
        status: form.status,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        items: validItems.map((it) => ({
          description: it.description.trim(),
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.unitPrice) || 0,
        })),
      }
      const saved = invoice
        ? await dataClient.invoices.update({ ...invoice, ...fields })
        : await dataClient.invoices.create({ ...fields, number: nextInvoiceNumber(await dataClient.invoices.list()) })
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
      title={isEdit ? 'Modifier la facture' : 'Nouvelle facture'}
      description={isEdit ? 'Mettre à jour les informations de cette facture.' : 'Émettre une facture pour un client.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Client
            <select
              className={inputClass}
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
              disabled={Boolean(clientId) && !isEdit}
              required
            >
              <option value="" disabled>
                Sélectionner un client
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Mission (optionnel)
            <select className={inputClass} value={form.missionId} onChange={(e) => update('missionId', e.target.value)}>
              <option value="">Aucune</option>
              {missionsForClient.map((m) => (
                <option key={m.id} value={m.id}>{m.reference} · {m.title}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Statut
            <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value as InvoiceStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <div />
          <label className={labelClass}>
            Date d'émission
            <input type="date" className={inputClass} value={form.issueDate} onChange={(e) => update('issueDate', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Date d'échéance
            <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} required />
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Prestations</span>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              <Plus className="h-3.5 w-3.5" />
              Ajouter une ligne
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {form.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={`${inputClass} mt-0 flex-1`}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                />
                <input
                  type="number"
                  min={0}
                  className={`${inputClass} mt-0 w-20`}
                  placeholder="Qté"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: e.target.value })}
                />
                <input
                  type="number"
                  min={0}
                  className={`${inputClass} mt-0 w-28`}
                  placeholder="Prix unitaire"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={form.items.length === 1}
                  className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 disabled:opacity-30"
                  aria-label="Supprimer la ligne"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-right text-sm font-semibold text-slate-800">Total : {formatCurrencyDZD(total)}</p>
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
            {submitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer la facture'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
