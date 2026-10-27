import { daysUntil } from './format'
import type { Invoice, InvoiceStatus } from '../types'

/** HT subtotal (sum of line items), before VAT and stamp duty. */
export function invoiceTotalHT(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function invoiceVAT(invoice: Invoice): number {
  return invoiceTotalHT(invoice) * (invoice.vatRate / 100)
}

/** Droit de timbre only applies when the invoice is paid in cash. */
export function invoiceStampDuty(invoice: Invoice): number {
  return invoice.paymentMode === 'Espèces' ? invoice.stampDuty : 0
}

/** TTC total: what's actually owed - HT + VAT + stamp duty (if cash). */
export function invoiceTotalTTC(invoice: Invoice): number {
  return invoiceTotalHT(invoice) + invoiceVAT(invoice) + invoiceStampDuty(invoice)
}

export function invoicePaidAmount(invoice: Invoice): number {
  return invoice.payments.reduce((sum, p) => sum + p.amount, 0)
}

/** Remaining amount owed, never negative (an overpayment still reads as a zero balance). */
export function invoiceBalance(invoice: Invoice): number {
  return Math.max(0, invoiceTotalTTC(invoice) - invoicePaidAmount(invoice))
}

/**
 * "En retard" is derived from the due date, never stored: a manually-set
 * status drifts the moment the clock moves past the due date (this was the
 * audit's top finding - 510 000 DA overdue showing as "0 DA en retard").
 * "Payée" is also derived once recorded encaissements cover the balance,
 * on top of the manual flag (handy for invoices settled before encaissements
 * were tracked, or when someone doesn't need the payment detail logged).
 * "Annulée" stays a manual, terminal state.
 */
export function effectiveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === 'Payée' || invoice.status === 'Annulée') return invoice.status
  if (invoice.payments.length > 0 && invoiceBalance(invoice) <= 0) return 'Payée'
  return daysUntil(invoice.dueDate) < 0 ? 'En retard' : invoice.status
}
