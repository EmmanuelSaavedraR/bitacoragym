-- Bitácora de Hierro · migración 2 (solo si ya tenías la base de datos creada)
-- Pega esto en Supabase → SQL Editor → New query → Run. Es seguro repetirlo.
alter table public.exercises
  add column if not exists rep_min int,
  add column if not exists rep_max int,
  add column if not exists rest_sec int,
  add column if not exists default_sets int,
  add column if not exists how_to text not null default '',
  add column if not exists favorite boolean not null default false,
  add column if not exists archived boolean not null default false,
  add column if not exists image_url text;

notify pgrst, 'reload schema';
