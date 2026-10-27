import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import { formatCurrencyDZD } from '../../lib/format'
import type { Client, Invoice, InvoiceStatus, Mission, PaymentMode } from '../../types'

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
const PAYMENT_MODES: PaymentMode[] = ['Virement', 'Chèque', 'Espèces']

interface ItemForm {
  description: string
  quantity: string
  unitPrice: string
}

interface PaymentForm {
  date: string
  amount: string
  mode: PaymentMode
  reference: string
}

const EMPTY_ITEM: ItemForm = { description: '', quantity: '1', unitPrice: '' }

function emptyPayment(): PaymentForm {
  return { date: new Date().toISOString().slice(0, 10), amount: '', mode: 'Virement', reference: '' }
}

function todayPlusDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function emptyForm(clientId?: string) {
  return {
    number: '',
    clientId: clientId ?? '',
    missionId: '',
    status: 'En attente' as InvoiceStatus,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: todayPlusDays(30),
    items: [{ ...EMPTY_ITEM }] as ItemForm[],
    vatRate: '19',
    paymentMode: 'Virement' as PaymentMode,
    stampDuty: '0',
    payments: [] as PaymentForm[],
  }
}

function formFromInvoice(invoice: Invoice): ReturnType<typeof emptyForm> {
  return {
    number: invoice.number,
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
    vatRate: String(invoice.vatRate),
    paymentMode: invoice.paymentMode,
    stampDuty: String(invoice.stampDuty),
    payments: invoice.payments.map((p) => ({
      date: p.date,
      amount: String(p.amount),
      mode: p.mode,
      reference: p.reference,
    })),
  }
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

  function updatePayment(index: number, patch: Partial<PaymentForm>) {
    setForm((prev) => ({
      ...prev,
      payments: prev.payments.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }))
  }

  function addPayment() {
    setForm((prev) => ({ ...prev, payments: [...prev.payments, emptyPayment()] }))
  }

  function removePayment(index: number) {
    setForm((prev) => ({ ...prev, payments: prev.payments.filter((_, i) => i !== index) }))
  }

  const missionsForClient = missions.filter((m) => !form.clientId || m.clientId === form.clientId)
  const totalHT = form.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0)
  const vat = totalHT * ((Number(form.vatRate) || 0) / 100)
  const stampDuty = form.paymentMode === 'Espèces' ? Number(form.stampDuty) || 0 : 0
  const totalTTC = totalHT + vat + stampDuty
  const totalPaid = form.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const balance = Math.max(0, totalTTC - totalPaid)

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validItems = form.items.filter((it) => it.description.trim())
    const validPayments = form.payments.filter((p) => (Number(p.amount) || 0) > 0)
    if (!form.number.trim() || !form.clientId || validItems.length === 0) {
      setError('Veuillez renseigner le numéro de facture VosFactures, le client et au moins une ligne de prestation.')
      return
    }
    if (form.dueDate < form.issueDate) {
      setError("La date d'échéance ne peut pas précéder la date d'émission.")
      return
    }
    if (validPayments.some((p) => !p.date)) {
      setError('Veuillez renseigner la date de chaque encaissement.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const fields = {
        number: form.number.trim(),
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
        vatRate: Number(form.vatRate) || 0,
        paymentMode: form.paymentMode,
        stampDuty: Number(form.stampDuty) || 0,
        payments: validPayments.map((p) => ({
          date: p.date,
          amount: Number(p.amount) || 0,
          mode: p.mode,
          reference: p.reference.trim(),
        })),
      }
      const saved = invoice
        ? await dataClient.invoices.update({ ...invoice, ...fields })
        : await dataClient.invoices.create(fields)
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
      description={
        isEdit
          ? 'Mettre à jour les informations de cette facture.'
          : "Enregistrer une facture déjà émise dans VosFactures (source légale de numérotation) : son numéro, son client et ses lignes."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Numéro de facture (VosFactures)</span>
            <input
              className={inputClass}
              value={form.number}
              onChange={(e) => update('number', e.target.value)}
              placeholder="ex. F-18"
              required
            />
          </label>
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
          <label className={labelClass}>
            Mode de paiement prévu
            <select className={inputClass} value={form.paymentMode} onChange={(e) => update('paymentMode', e.target.value as PaymentMode)}>
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Date d'émission
            <input type="date" className={inputClass} value={form.issueDate} onChange={(e) => update('issueDate', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Date d'échéance
            <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Taux de TVA (%)
            <input type="number" min={0} max={100} className={inputClass} value={form.vatRate} onChange={(e) => update('vatRate', e.target.value)} />
          </label>
          {form.paymentMode === 'Espèces' && (
            <label className={labelClass}>
              Droit de timbre (DA)
              <input type="number" min={0} className={inputClass} value={form.stampDuty} onChange={(e) => update('stampDuty', e.target.value)} />
              <span className="mt-0.5 block text-[11px] font-normal text-slate-400">À vérifier selon le barème en vigueur.</span>
            </label>
          )}
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
          <div className="mt-2 space-y-0.5 text-right text-sm text-slate-600">
            <p>Total HT : {formatCurrencyDZD(totalHT)}</p>
            <p>TVA ({form.vatRate || 0}%) : {formatCurrencyDZD(vat)}</p>
            {stampDuty > 0 && <p>Droit de timbre : {formatCurrencyDZD(stampDuty)}</p>}
            <p className="font-semibold text-slate-800">Total TTC : {formatCurrencyDZD(totalTTC)}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Encaissements</span>
            <button type="button" onClick={addPayment} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              <Plus className="h-3.5 w-3.5" />
              Ajouter un encaissement
            </button>
          </div>
          {form.payments.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">Aucun encaissement enregistré. Paiements partiels acceptés.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {form.payments.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="date"
                    className={`${inputClass} mt-0 w-36`}
                    value={p.date}
                    onChange={(e) => updatePayment(i, { date: e.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    className={`${inputClass} mt-0 w-28`}
                    placeholder="Montant"
                    value={p.amount}
                    onChange={(e) => updatePayment(i, { amount: e.target.value })}
                  />
                  <select
                    className={`${inputClass} mt-0 w-28`}
                    value={p.mode}
                    onChange={(e) => updatePayment(i, { mode: e.target.value as PaymentMode })}
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    className={`${inputClass} mt-0 flex-1`}
                    placeholder="Référence"
                    value={p.reference}
                    onChange={(e) => updatePayment(i, { reference: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removePayment(i)}
                    className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                    aria-label="Supprimer l'encaissement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-right text-sm font-semibold text-slate-800">Solde restant : {formatCurrencyDZD(balance)}</p>
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
