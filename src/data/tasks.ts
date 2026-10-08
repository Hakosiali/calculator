import type { Task } from '../types'

export const tasks: Task[] = [
  // m1 - Recrutement de 8 cadres production (Atlas Agro)
  { id: 'tk1', title: 'Publier les offres sur les jobboards', missionId: 'm1', assignee: 'Nadia Cherif', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-08-10', description: 'Diffusion des 8 annonces sur Emploitic, LinkedIn et le site HRCC.' },
  { id: 'tk2', title: 'Présélection des CV reçus', missionId: 'm1', assignee: 'Nadia Cherif', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-08-28', description: 'Tri et shortlist de 24 candidats sur les 180 candidatures reçues.' },
  { id: 'tk3', title: 'Entretiens 1er tour - ingénieurs process', missionId: 'm1', assignee: 'Yacine Boumediene', status: 'En cours', priority: 'Haute', dueDate: '2026-10-12', description: 'Conduite des entretiens techniques pour 10 candidats présélectionnés.' },
  { id: 'tk4', title: 'Rapport de synthèse pour le client', missionId: 'm1', assignee: 'Nadia Cherif', status: 'À faire', priority: 'Haute', dueDate: '2026-10-20', description: 'Présentation des finalistes avec grille de notation à Atlas Agro.' },
  { id: 'tk5', title: 'Vérification des références', missionId: 'm1', assignee: 'Yacine Boumediene', status: 'À faire', priority: 'Moyenne', dueDate: '2026-10-28', description: 'Prise de références des 4 candidats finalistes.' },

  // m2 - Audit RH annuel 2026 (Numidia Electronics)
  { id: 'tk6', title: 'Collecte des données sociales', missionId: 'm2', assignee: 'Karim Haddad', status: 'Terminé', priority: 'Haute', dueDate: '2026-09-15', description: 'Récupération des effectifs, turnover et absentéisme sur 3 sites.' },
  { id: 'tk7', title: 'Entretiens avec les responsables de site', missionId: 'm2', assignee: 'Karim Haddad', status: 'En cours', priority: 'Haute', dueDate: '2026-10-15', description: '6 entretiens prévus avec les directeurs de site.' },
  { id: 'tk8', title: 'Analyse de la pyramide des âges', missionId: 'm2', assignee: 'Mehdi Ouzani', status: 'En cours', priority: 'Moyenne', dueDate: '2026-10-25', description: 'Étude des risques de départ en retraite sur 5 ans.' },
  { id: 'tk9', title: 'Vérification conformité paie', missionId: 'm2', assignee: 'Karim Haddad', status: 'À faire', priority: 'Urgente', dueDate: '2026-11-05', description: 'Contrôle des bulletins de paie et cotisations CNAS/CASNOS.' },
  { id: 'tk10', title: 'Rédaction du rapport final', missionId: 'm2', assignee: 'Karim Haddad', status: 'À faire', priority: 'Haute', dueDate: '2026-12-05', description: 'Synthèse complète avec plan d\'actions recommandé.' },

  // m3 - Restructuration siège (Numidia) - planifiée
  { id: 'tk11', title: 'Cadrage du projet avec la direction', missionId: 'm3', assignee: 'Mehdi Ouzani', status: 'À faire', priority: 'Urgente', dueDate: '2026-11-05', description: 'Réunion de cadrage pour définir le périmètre et les objectifs.' },
  { id: 'tk12', title: 'État des lieux organigramme actuel', missionId: 'm3', assignee: 'Mehdi Ouzani', status: 'À faire', priority: 'Haute', dueDate: '2026-11-20', description: 'Cartographie de l\'organisation actuelle du siège.' },

  // m4 - Paie régime Sud (Sahara Energies)
  { id: 'tk13', title: 'Audit du paramétrage logiciel paie', missionId: 'm4', assignee: 'Karim Haddad', status: 'Terminé', priority: 'Haute', dueDate: '2026-08-01', description: 'Vérification des règles de calcul des primes dérogatoires.' },
  { id: 'tk14', title: 'Recalcul des primes de zone et d\'éloignement', missionId: 'm4', assignee: 'Karim Haddad', status: 'En cours', priority: 'Urgente', dueDate: '2026-10-10', description: 'Recalcul rétroactif sur 6 mois pour 1200 salariés.' },
  { id: 'tk15', title: 'Formation des gestionnaires paie', missionId: 'm4', assignee: 'Karim Haddad', status: 'En révision', priority: 'Moyenne', dueDate: '2026-10-18', description: 'Session de formation sur le nouveau paramétrage.' },
  { id: 'tk16', title: 'Validation finale avec la DRH', missionId: 'm4', assignee: 'Karim Haddad', status: 'À faire', priority: 'Haute', dueDate: '2026-10-29', description: 'Revue finale avant mise en production du nouveau paramétrage.' },

  // m6 - Formation managériale (Banque El Djazair)
  { id: 'tk17', title: 'Module 1 - Leadership situationnel', missionId: 'm6', assignee: 'Sarah Benali', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-07-10', description: 'Session délivrée aux 45 cadres intermédiaires.' },
  { id: 'tk18', title: 'Module 2 - Gestion de la performance', missionId: 'm6', assignee: 'Sarah Benali', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-08-20', description: 'Session délivrée sur les 3 agences pilotes.' },
  { id: 'tk19', title: 'Module 3 - Conduite du changement', missionId: 'm6', assignee: 'Sarah Benali', status: 'En cours', priority: 'Moyenne', dueDate: '2026-10-22', description: 'Préparation des supports et exercices pratiques.' },
  { id: 'tk20', title: 'Évaluation à chaud des participants', missionId: 'm6', assignee: 'Sarah Benali', status: 'À faire', priority: 'Basse', dueDate: '2026-10-30', description: 'Questionnaires de satisfaction post-module 3.' },

  // m8 - Paie Tell Pharma
  { id: 'tk21', title: 'Diagnostic du processus actuel', missionId: 'm8', assignee: 'Karim Haddad', status: 'Terminé', priority: 'Haute', dueDate: '2026-09-25', description: 'Cartographie du circuit de paie existant.' },
  { id: 'tk22', title: 'Définition du nouveau circuit de validation', missionId: 'm8', assignee: 'Karim Haddad', status: 'En cours', priority: 'Haute', dueDate: '2026-10-20', description: 'Proposition de workflow avec double validation RH/Finance.' },
  { id: 'tk23', title: 'Paramétrage des 60 nouveaux contrats', missionId: 'm8', assignee: 'Karim Haddad', status: 'À faire', priority: 'Moyenne', dueDate: '2026-11-10', description: 'Intégration des nouveaux salariés dans le logiciel de paie.' },

  // m9 - Structuration RH Click Logistique
  { id: 'tk24', title: 'Rédaction du règlement intérieur', missionId: 'm9', assignee: 'Amina Belkacemi', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-06-15', description: 'Document conforme à la législation du travail algérienne.' },
  { id: 'tk25', title: 'Grille de classification des postes', missionId: 'm9', assignee: 'Amina Belkacemi', status: 'En cours', priority: 'Haute', dueDate: '2026-10-18', description: 'Définition de 6 niveaux de classification pour 180 salariés.' },
  { id: 'tk26', title: 'Modèles de contrats types', missionId: 'm9', assignee: 'Mehdi Ouzani', status: 'En révision', priority: 'Moyenne', dueDate: '2026-10-24', description: 'CDI, CDD et contrats de chauffeurs-livreurs.' },
  { id: 'tk27', title: 'Présentation finale à la direction', missionId: 'm9', assignee: 'Amina Belkacemi', status: 'À faire', priority: 'Moyenne', dueDate: '2026-11-25', description: 'Restitution de l\'ensemble des livrables.' },

  // m11 - Recrutement conducteurs de travaux (Constantine BTP)
  { id: 'tk28', title: 'Sourcing conducteurs de travaux', missionId: 'm11', assignee: 'Nadia Cherif', status: 'Terminé', priority: 'Haute', dueDate: '2026-09-05', description: 'Identification de 15 profils qualifiés via réseau et jobboards.' },
  { id: 'tk29', title: 'Entretiens techniques chantier', missionId: 'm11', assignee: 'Yacine Boumediene', status: 'Terminé', priority: 'Haute', dueDate: '2026-09-28', description: 'Évaluation technique avec le directeur de chantier.' },
  { id: 'tk30', title: 'Finalisation des offres d\'embauche', missionId: 'm11', assignee: 'Nadia Cherif', status: 'En cours', priority: 'Urgente', dueDate: '2026-10-15', description: 'Rédaction et envoi des 5 promesses d\'embauche.' },

  // m12 - Recrutement continu ouvriers (Constantine BTP)
  { id: 'tk31', title: 'Vivier de candidats électriciens', missionId: 'm12', assignee: 'Nadia Cherif', status: 'En cours', priority: 'Basse', dueDate: '2026-11-15', description: 'Constitution d\'un vivier pour les besoins futurs.' },

  // m14 - DigitalDZ
  { id: 'tk32', title: 'Rédaction des contrats de travail types', missionId: 'm14', assignee: 'Mehdi Ouzani', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-09-18', description: 'CDI et CDD adaptés au secteur IT.' },
  { id: 'tk33', title: 'Construction de la grille salariale', missionId: 'm14', assignee: 'Mehdi Ouzani', status: 'En cours', priority: 'Haute', dueDate: '2026-10-20', description: 'Benchmark des salaires du secteur tech algérien.' },
  { id: 'tk34', title: 'Mise en place du processus d\'entretien annuel', missionId: 'm14', assignee: 'Mehdi Ouzani', status: 'À faire', priority: 'Moyenne', dueDate: '2026-11-15', description: 'Trame d\'entretien et calendrier annuel.' },

  // m16 - Formation chefs de rayon (Oasis Retail)
  { id: 'tk35', title: 'Conception du programme de formation', missionId: 'm16', assignee: 'Sarah Benali', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-09-15', description: 'Programme sur 4 jours : management et relation client.' },
  { id: 'tk36', title: 'Session Ouargla + Touggourt', missionId: 'm16', assignee: 'Sarah Benali', status: 'Terminé', priority: 'Moyenne', dueDate: '2026-09-30', description: '14 chefs de rayon formés sur les 2 sites.' },
  { id: 'tk37', title: 'Session El Oued + Hassi Messaoud', missionId: 'm16', assignee: 'Sarah Benali', status: 'En cours', priority: 'Moyenne', dueDate: '2026-10-22', description: '14 chefs de rayon restants à former.' },
  { id: 'tk38', title: 'Bilan pédagogique global', missionId: 'm16', assignee: 'Sarah Benali', status: 'À faire', priority: 'Basse', dueDate: '2026-11-05', description: 'Rapport final avec recommandations de suivi.' },

  // m19 - Négociation sociale (Banque El Djazair)
  { id: 'tk39', title: 'Préparation du dossier de négociation', missionId: 'm19', assignee: 'Amina Belkacemi', status: 'Terminé', priority: 'Urgente', dueDate: '2026-09-28', description: 'Analyse comparative et argumentaire chiffré.' },
  { id: 'tk40', title: 'Accompagnement séance 1 et 2', missionId: 'm19', assignee: 'Amina Belkacemi', status: 'Terminé', priority: 'Urgente', dueDate: '2026-10-12', description: 'Présence aux côtés de la DRH lors des négociations.' },
  { id: 'tk41', title: 'Rédaction du procès-verbal d\'accord', missionId: 'm19', assignee: 'Amina Belkacemi', status: 'En cours', priority: 'Urgente', dueDate: '2026-10-29', description: 'Formalisation de l\'accord final avec les partenaires sociaux.' },

  // m13 - Zeralda Resort (planifiée / prospect)
  { id: 'tk42', title: 'Finaliser la proposition commerciale', missionId: 'm13', assignee: 'Sarah Benali', status: 'En cours', priority: 'Moyenne', dueDate: '2026-10-14', description: 'Ajustement du devis suite aux retours du client.' },
  { id: 'tk43', title: 'Relance commerciale', missionId: 'm13', assignee: 'Amina Belkacemi', status: 'À faire', priority: 'Basse', dueDate: '2026-10-20', description: 'Appel de suivi pour valider le lancement de la mission.' },

  // m18 - Revue grille salariale Atlas Agro (planifiée)
  { id: 'tk44', title: 'Collecte des grilles sectorielles de référence', missionId: 'm18', assignee: 'Karim Haddad', status: 'À faire', priority: 'Basse', dueDate: '2026-11-18', description: 'Benchmark marché agroalimentaire.' },
]
