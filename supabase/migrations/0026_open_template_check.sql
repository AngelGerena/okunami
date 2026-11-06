-- Migration 0017: stop the database from rejecting new designs.
-- fc_cards and fc_looks had a check listing every allowed design id. Each new collection
-- (Glam, Glam Rail, Darkroom, and later ones) needed that list updated, and when it was missed,
-- saving a card on a new design failed. The app already validates designs, so the database now
-- only checks that the id is a plain, safe name.
alter table public.fc_cards drop constraint if exists fc_cards_template;
alter table public.fc_cards add constraint fc_cards_template check (template ~ '^[a-z0-9-]{1,40}$');

alter table public.fc_looks drop constraint if exists fc_looks_template;
alter table public.fc_looks add constraint fc_looks_template check (template ~ '^[a-z0-9-]{1,40}$');

notify pgrst, 'reload schema';
