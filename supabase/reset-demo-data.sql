-- Wipes every row from every HRCC table, leaving the schema (and RLS
-- policies) intact - use this once to clear the fictional demo data
-- (Atlas Agro SPA, Amina Belkacemi, etc.) so the app starts empty for
-- real use. Run this once in the Supabase SQL editor. There is no undo:
-- back up first (Table Editor -> export) if you want to keep anything.
--
-- Deletes in dependency order so foreign keys never block a delete,
-- even though most of these already cascade from clients/missions.

delete from calendar_events;
delete from documents;
delete from invoices;
delete from tasks;
delete from missions;
delete from clients;
delete from team_members;

-- The app needs at least one team member to populate the "Consultant"
-- and "Responsable" dropdowns on the mission/task/document forms, or
-- those forms won't have anything to select. Add yourself (or whoever
-- should show up first) here - you can add more afterwards from the
-- "Équipe" page in the app itself.
insert into team_members (id, name, role, initials) values
  ('t1', 'Nom Prénom', 'Fonction', 'NP');
