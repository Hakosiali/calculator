import type { Invoice } from '../types'

export const invoices: Invoice[] = [
  {
    id: 'i1', number: 'HRCC-2026-034', clientId: 'c2', missionId: 'm2', status: 'Payée',
    issueDate: '2026-09-22', dueDate: '2026-10-22',
    items: [{ description: 'Audit RH annuel 2026 - acompte 50%', quantity: 1, unitPrice: 1100000 }],
  },
  {
    id: 'i2', number: 'HRCC-2026-048', clientId: 'c12', missionId: 'm16', status: 'Payée',
    issueDate: '2026-10-01', dueDate: '2026-10-31',
    items: [{ description: 'Formation chefs de rayon - session 1 & 2', quantity: 1, unitPrice: 550000 }],
  },
  {
    id: 'i3', number: 'HRCC-2026-051', clientId: 'c1', missionId: 'm1', status: 'En attente',
    issueDate: '2026-10-01', dueDate: '2026-11-01',
    items: [{ description: 'Recrutement 8 cadres production - facture intermédiaire', quantity: 1, unitPrice: 675000 }],
  },
  {
    id: 'i4', number: 'HRCC-2026-052', clientId: 'c3', missionId: 'm4', status: 'En attente',
    issueDate: '2026-10-02', dueDate: '2026-11-02',
    items: [
      { description: 'Mise en conformité paie - phase diagnostic', quantity: 1, unitPrice: 900000 },
      { description: 'Formation gestionnaires paie', quantity: 1, unitPrice: 250000 },
    ],
  },
  {
    id: 'i5', number: 'HRCC-2026-029', clientId: 'c4', missionId: 'm6', status: 'En retard',
    issueDate: '2026-08-15', dueDate: '2026-09-15',
    items: [{ description: 'Programme formation managériale - module 1 & 2', quantity: 1, unitPrice: 1750000 }],
  },
  {
    id: 'i6', number: 'HRCC-2026-055', clientId: 'c5', missionId: 'm8', status: 'En attente',
    issueDate: '2026-10-05', dueDate: '2026-11-05',
    items: [{ description: 'Refonte processus de paie - acompte', quantity: 1, unitPrice: 500000 }],
  },
  {
    id: 'i7', number: 'HRCC-2026-041', clientId: 'c6', missionId: 'm9', status: 'Payée',
    issueDate: '2026-09-01', dueDate: '2026-10-01',
    items: [{ description: 'Structuration RH - règlement intérieur et contrats types', quantity: 1, unitPrice: 950000 }],
  },
  {
    id: 'i8', number: 'HRCC-2025-091', clientId: 'c7', missionId: 'm10', status: 'Payée',
    issueDate: '2025-07-20', dueDate: '2025-08-20',
    items: [{ description: 'Audit RH complet - solde final', quantity: 1, unitPrice: 1650000 }],
  },
  {
    id: 'i9', number: 'HRCC-2026-044', clientId: 'c8', missionId: 'm11', status: 'Payée',
    issueDate: '2026-09-15', dueDate: '2026-10-15',
    items: [{ description: 'Recrutement conducteurs de travaux', quantity: 1, unitPrice: 980000 }],
  },
  {
    id: 'i10', number: 'HRCC-2026-038', clientId: 'c8', missionId: 'm12', status: 'En retard',
    issueDate: '2026-08-30', dueDate: '2026-09-30',
    items: [{ description: 'Recrutement continu ouvriers qualifiés - T3 2026', quantity: 1, unitPrice: 400000 }],
  },
  {
    id: 'i11', number: 'HRCC-2026-033', clientId: 'c10', missionId: 'm14', status: 'Payée',
    issueDate: '2026-09-05', dueDate: '2026-10-05',
    items: [{ description: 'Mise en place outils RH - phase 1', quantity: 1, unitPrice: 425000 }],
  },
  {
    id: 'i12', number: 'HRCC-2026-057', clientId: 'c4', missionId: 'm19', status: 'En attente',
    issueDate: '2026-10-06', dueDate: '2026-10-21',
    items: [{ description: 'Accompagnement négociation annuelle obligatoire', quantity: 1, unitPrice: 1750000 }],
  },
  {
    id: 'i13', number: 'HRCC-2025-078', clientId: 'c12', missionId: 'm17', status: 'Payée',
    issueDate: '2026-01-18', dueDate: '2026-02-18',
    items: [{ description: 'Campagne de recrutement saisonnier', quantity: 1, unitPrice: 620000 }],
  },
  {
    id: 'i14', number: 'HRCC-2025-065', clientId: 'c3', missionId: 'm5', status: 'Payée',
    issueDate: '2026-01-25', dueDate: '2026-02-25',
    items: [{ description: 'Audit social & sécurité sur site - solde', quantity: 1, unitPrice: 1300000 }],
  },
  {
    id: 'i15', number: 'HRCC-2024-112', clientId: 'c4', missionId: 'm7', status: 'Payée',
    issueDate: '2025-10-02', dueDate: '2025-11-02',
    items: [{ description: 'Conseil stratégique - plan de succession', quantity: 1, unitPrice: 2900000 }],
  },
  {
    id: 'i16', number: 'HRCC-2026-021', clientId: 'c5', missionId: 'm20', status: 'Annulée',
    issueDate: '2025-09-10', dueDate: '2025-10-10',
    items: [{ description: 'Audit paie et charges sociales (mission annulée)', quantity: 1, unitPrice: 75000 }],
  },
]
