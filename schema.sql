-- ============================================================================
-- Bitácora de Hierro · esquema de base de datos (v2)
-- Pégalo completo en Supabase → SQL Editor → New query → Run.
-- Es seguro volver a ejecutarlo: no borra datos existentes.
--
-- Diseño: una fila por registro, sin JSON anidado, para que cualquier
-- herramienta (Sheets, Excel, Looker Studio, Python, Metabase) lo lea directo.
-- Todas las tablas tienen user_id y seguridad por fila (RLS): cada cuenta
-- solo puede ver y modificar sus propios datos.
-- ============================================================================

-- Ejercicios (biblioteca). El id es un slug estable, p. ej. 'press-banca'.
create table if not exists public.exercises (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id         text not null,
  name       text not null,
  muscle     text not null default 'Otro',
  secondary  text[] not null default '{}',   -- músculos secundarios (cuentan 0.5 serie)
  equipment  text,
  note       text not null default '',
  rep_min    int,                              -- rango de repeticiones propio del ejercicio
  rep_max    int,
  rest_sec   int,                              -- descanso sugerido (segundos)
  default_sets int,                            -- series sugeridas
  how_to     text not null default '',         -- indicaciones de técnica
  favorite   boolean not null default false,
  archived   boolean not null default false,   -- oculto en listas, conserva el historial
  image_url  text,                             -- reservado para imágenes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Si tu tabla de ejercicios ya existía (versión anterior), esto agrega las columnas nuevas.
alter table public.exercises
  add column if not exists rep_min int,
  add column if not exists rep_max int,
  add column if not exists rest_sec int,
  add column if not exists default_sets int,
  add column if not exists how_to text not null default '',
  add column if not exists favorite boolean not null default false,
  add column if not exists archived boolean not null default false,
  add column if not exists image_url text;

-- Rutinas en rotación. position define el orden de la rotación.
create table if not exists public.templates (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id         text not null,
  name       text not null,
  position   int  not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.template_items (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  template_id text not null,
  position    int  not null,
  exercise_id text not null,
  sets        int  not null default 3,
  rep_min     int,
  rep_max     int,
  rest_sec    int,
  primary key (user_id, template_id, position)
);

-- Sesiones de entrenamiento (una fila por sesión).
create table if not exists public.sessions (
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id             text not null,
  date           date not null,
  started_at     timestamptz,
  ended_at       timestamptz,
  duration_min   int,
  template_id    text,
  template_name  text,
  kind           text not null default 'rutina',   -- rutina | por_grupos | libre
  muscles        text[] not null default '{}',
  energy         int check (energy between 1 and 5),
  sleep_h        numeric(4,1),
  notes          text not null default '',
  revision       int  not null default 1,
  schema_version int  not null default 2,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,                       -- borrado suave (papelera)
  primary key (user_id, id)
);
create index if not exists sessions_date_idx on public.sessions (user_id, date desc);

-- Series (una fila por serie): la tabla principal para análisis.
create table if not exists public.session_sets (
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id    text not null,
  exercise_pos  int  not null,          -- orden del ejercicio dentro de la sesión (desde 0)
  set_pos       int  not null,          -- orden de la serie dentro del ejercicio (desde 0)
  exercise_id   text not null,
  exercise_name text not null,
  muscle        text,
  secondary     text[] not null default '{}',
  equipment     text,
  rep_min       int,
  rep_max       int,
  rest_sec      int,
  set_type      text not null default 'N' check (set_type in ('N','W','D','F')), -- Normal, Calentamiento, Drop, Fallo
  weight_kg     numeric(7,2) not null default 0,
  reps          int not null default 0,
  rir           numeric(3,1),
  primary key (user_id, session_id, exercise_pos, set_pos)
);
create index if not exists session_sets_ex_idx on public.session_sets (user_id, exercise_id);

-- Medidas corporales (perímetros en cm).
create table if not exists public.measurements (
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date         date not null,
  shoulders    numeric(5,1),
  chest        numeric(5,1),
  arm_relaxed  numeric(5,1),
  arm_flexed   numeric(5,1),
  waist        numeric(5,1),
  hips         numeric(5,1),
  thigh        numeric(5,1),
  calf         numeric(5,1),
  weight_avg7  numeric(5,1),
  notes        text not null default '',
  updated_at   timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.bodyweight (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date       date not null,
  weight_kg  numeric(5,1) not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- Comidas (una fila por alimento o comida registrada).
create table if not exists public.food_entries (
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id          text not null,
  date        date not null,
  meal        text not null default 'Comida',    -- Desayuno | Comida | Cena | Snack
  description text not null default '',
  kcal        numeric(7,1) not null default 0,
  protein_g   numeric(6,1) not null default 0,
  carbs_g     numeric(6,1),
  fat_g       numeric(6,1),
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists food_date_idx on public.food_entries (user_id, date desc);

-- Metas y ajustes (una fila por cuenta).
create table if not exists public.settings (
  user_id    uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  kcal       int,
  protein_g  int,
  set_min    int not null default 10,
  set_max    int not null default 20,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Seguridad por fila: cada cuenta solo accede a sus filas.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['exercises','templates','template_items','sessions','session_sets',
                           'measurements','bodyweight','food_entries','settings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Vista lista para gráficas externas: una fila por serie, con e1RM y volumen.
-- (Conéctala a Looker Studio, Metabase, Python, etc.)
-- ---------------------------------------------------------------------------
create or replace view public.series_flat with (security_invoker = true) as
select
  s.date                                  as fecha,
  s.id                                    as sesion_id,
  s.template_name                         as rutina,
  s.kind                                  as tipo_sesion,
  ss.exercise_pos + 1                     as orden_ejercicio,
  ss.exercise_id                          as ejercicio_id,
  ss.exercise_name                        as ejercicio,
  ss.muscle                               as grupo_muscular,
  array_to_string(ss.secondary, '|')      as musculos_secundarios,
  ss.equipment                            as equipo,
  ss.set_pos + 1                          as serie,
  ss.set_type                             as tipo_serie,
  (ss.set_type <> 'W')                    as es_efectiva,
  ss.weight_kg                            as peso_kg,
  ss.reps                                 as reps,
  ss.rir                                  as rir,
  case when ss.set_type <> 'W' and ss.weight_kg > 0 and ss.reps > 0
       then round((ss.weight_kg * (1 + ss.reps / 30.0))::numeric, 1) end as e1rm_kg,
  case when ss.set_type <> 'W' then ss.weight_kg * ss.reps else 0 end    as volumen_kg,
  s.energy                                as energia_1a5,
  s.sleep_h                               as sueno_h
from public.sessions s
join public.session_sets ss
  on ss.session_id = s.id and ss.user_id = s.user_id
where s.deleted_at is null;

-- Actualiza la caché de la API para que reconozca las columnas nuevas.
notify pgrst, 'reload schema';
