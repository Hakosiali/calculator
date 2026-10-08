import type { CalendarEvent } from '../types'

export const calendarEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Entretiens 1er tour - ingénieurs process', date: '2026-10-08', time: '09:00', type: 'Entretien', clientId: 'c1', missionId: 'm1', location: 'HRCC - Salle A' },
  { id: 'e2', title: 'Entretiens avec responsables de site', date: '2026-10-09', time: '10:30', type: 'Réunion', clientId: 'c2', missionId: 'm2', location: 'Numidia Electronics - Siège BBA' },
  { id: 'e3', title: 'Échéance facture HRCC-2026-029', date: '2026-10-09', time: '00:00', type: 'Échéance', clientId: 'c4', missionId: 'm6', location: '—' },
  { id: 'e4', title: 'Formation - Conduite du changement (Module 3)', date: '2026-10-12', time: '09:00', type: 'Formation', clientId: 'c4', missionId: 'm6', location: 'Agence pilote Alger-Centre' },
  { id: 'e5', title: 'Point hebdomadaire équipe consultants', date: '2026-10-13', time: '08:30', type: 'Réunion', clientId: null, missionId: null, location: 'HRCC - Salle de réunion' },
  { id: 'e6', title: 'Formation gestionnaires paie - Sahara Energies', date: '2026-10-14', time: '09:00', type: 'Formation', clientId: 'c3', missionId: 'm4', location: 'Visioconférence' },
  { id: 'e7', title: 'Présentation proposition - Zeralda Resort', date: '2026-10-14', time: '14:00', type: 'Réunion', clientId: 'c9', missionId: 'm13', location: 'Zeralda Resort & Hôtellerie' },
  { id: 'e8', title: 'Remise des offres d\'embauche', date: '2026-10-15', time: '11:00', type: 'Livraison', clientId: 'c8', missionId: 'm11', location: 'Constantine BTP' },
  { id: 'e9', title: 'Session formation - El Oued / Hassi Messaoud', date: '2026-10-18', time: '09:00', type: 'Formation', clientId: 'c12', missionId: 'm16', location: 'Point de vente El Oued' },
  { id: 'e10', title: 'Grille de classification - revue intermédiaire', date: '2026-10-19', time: '15:00', type: 'Réunion', clientId: 'c6', missionId: 'm9', location: 'Click Logistique - Oran' },
  { id: 'e11', title: 'Échéance facture HRCC-2026-038', date: '2026-10-20', time: '00:00', type: 'Échéance', clientId: 'c8', missionId: 'm12', location: '—' },
  { id: 'e12', title: 'Validation grille salariale DigitalDZ', date: '2026-10-21', time: '10:00', type: 'Réunion', clientId: 'c10', missionId: 'm14', location: 'DigitalDZ Solutions' },
  { id: 'e13', title: 'Signature procès-verbal NAO', date: '2026-10-22', time: '09:30', type: 'Réunion', clientId: 'c4', missionId: 'm19', location: 'Banque El Djazair - Siège' },
  { id: 'e14', title: 'Livraison rapport de synthèse recrutement', date: '2026-10-24', time: '00:00', type: 'Livraison', clientId: 'c1', missionId: 'm1', location: '—' },
  { id: 'e15', title: 'Vérification des références candidats', date: '2026-10-26', time: '09:00', type: 'Entretien', clientId: 'c1', missionId: 'm1', location: 'HRCC - Bureau' },
  { id: 'e16', title: 'Réunion de cadrage - restructuration Numidia', date: '2026-11-03', time: '09:00', type: 'Réunion', clientId: 'c2', missionId: 'm3', location: 'Numidia Electronics - Siège BBA' },
  { id: 'e17', title: 'Validation finale paramétrage paie', date: '2026-10-29', time: '14:00', type: 'Réunion', clientId: 'c3', missionId: 'm4', location: 'Visioconférence' },
  { id: 'e18', title: 'Comité de pilotage mensuel HRCC', date: '2026-10-30', time: '17:00', type: 'Réunion', clientId: null, missionId: null, location: 'HRCC - Salle de réunion' },
]
