import { daysUntil } from './format'
import type { Invoice, InvoiceStatus } from '../types'

export function invoiceTotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

/**
 * "En retard" is derived from the due date, never stored: a manually-set
 * status drifts the moment the clock moves past the due date (this was the
 * audit's top finding - 510 000 DA overdue showing as "0 DA en retard").
 * Payée/Annulée are terminal and never get overridden.
 */
export function effectiveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === 'Payée' || invoice.status === 'Annulée') return invoice.status
  return daysUntil(invoice.dueDate) < 0 ? 'En retard' : invoice.status
}
