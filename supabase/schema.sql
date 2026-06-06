-- ============================================================================
--  Barbería — Esquema para una sola barbería (single-tenant) en Supabase
-- ============================================================================
--  Ejecuta este script en el SQL Editor de Supabase.
--
--  Modelo:
--    - UNA barbería por despliegue (sin tenants ni slugs).
--    - La web es PÚBLICA para los clientes (ver servicios y reservar, sin login).
--    - Solo el/los administradores inician sesión para gestionar el panel.
--    - Quién es administrador se define en la tabla `admins` (se inserta a mano
--      o vía seed; NO hay registro público).
-- ============================================================================

create extension if not exists "pgcrypto";  -- para gen_random_uuid()

-- ============================================================================
--  TABLAS
-- ============================================================================

-- settings: configuración/diseño de la barbería (una sola fila) --------------
create table if not exists public.settings (
  id            int primary key default 1,
  name          text not null default 'Mi Barbería',
  tagline       text default 'Cortes con estilo',
  phone         text,
  address       text,
  instagram     text,
  -- Personalización de diseño:
  primary_color text default '#111827',
  accent_color  text default '#f59e0b',
  about         text,
  opening_hours text,
  updated_at    timestamptz not null default now(),
  constraint settings_singleton check (id = 1)  -- fuerza una única fila
);

-- admins: usuarios autorizados a gestionar el panel --------------------------
-- El id coincide con auth.users.id. Se inserta manualmente tras crear el
-- usuario en Supabase Auth (no hay registro público).
create table if not exists public.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  created_at timestamptz not null default now()
);

-- clients: clientes de la barbería ------------------------------------------
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  notes      text,
  created_at timestamptz not null default now()
);

-- services: servicios (corte, barba, combos...) -----------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  duration_minutes int not null default 30 check (duration_minutes > 0),
  price            numeric(10, 2) not null default 0 check (price >= 0),
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

-- appointments: citas / reservas --------------------------------------------
create table if not exists public.appointments (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references public.clients(id) on delete set null,
  service_id     uuid references public.services(id) on delete set null,
  -- Datos del cliente que reserva online (snapshot, por comodidad)
  customer_name  text,
  customer_phone text,
  start_time     timestamptz not null,
  end_time       timestamptz not null,
  status         text not null default 'scheduled'
                 check (status in ('scheduled', 'completed', 'no_show', 'cancelled')),
  created_at     timestamptz not null default now()
);

create index if not exists idx_appointments_start on public.appointments(start_time);

-- ============================================================================
--  FUNCIÓN AUXILIAR: ¿el usuario actual es administrador?
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins a where a.id = auth.uid()
  );
$$;

-- ============================================================================
--  SEED: fila única de settings
-- ============================================================================
insert into public.settings (id, name, tagline)
values (1, 'Mi Barbería', 'Cortes con estilo')
on conflict (id) do nothing;

-- ============================================================================
--  ROW LEVEL SECURITY
-- ============================================================================
alter table public.settings     enable row level security;
alter table public.admins       enable row level security;
alter table public.clients      enable row level security;
alter table public.services     enable row level security;
alter table public.appointments enable row level security;

-- ---------------------------------------------------------------------------
--  SETTINGS  (lectura pública; escritura solo admin)
-- ---------------------------------------------------------------------------
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read"
  on public.settings for select using (true);

drop policy if exists "settings_admin_update" on public.settings;
create policy "settings_admin_update"
  on public.settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
--  ADMINS  (cada admin ve su propio registro; gestión manual desde Supabase)
-- ---------------------------------------------------------------------------
drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own"
  on public.admins for select to authenticated
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
--  SERVICES  (lectura pública para la web; escritura solo admin)
-- ---------------------------------------------------------------------------
drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
  on public.services for select using (true);

drop policy if exists "services_admin_insert" on public.services;
create policy "services_admin_insert"
  on public.services for insert to authenticated
  with check (public.is_admin());

drop policy if exists "services_admin_update" on public.services;
create policy "services_admin_update"
  on public.services for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "services_admin_delete" on public.services;
create policy "services_admin_delete"
  on public.services for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
--  CLIENTS  (alta pública desde la reserva online; gestión solo admin)
-- ---------------------------------------------------------------------------
-- Inserción anónima: al reservar online se registra el nombre/teléfono.
-- NOTA: para producción conviene añadir captcha / rate limit.
drop policy if exists "clients_public_insert" on public.clients;
create policy "clients_public_insert"
  on public.clients for insert to anon with check (true);

drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all"
  on public.clients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
--  APPOINTMENTS  (reserva pública en 'scheduled'; gestión solo admin)
-- ---------------------------------------------------------------------------
drop policy if exists "appointments_public_insert" on public.appointments;
create policy "appointments_public_insert"
  on public.appointments for insert to anon
  with check (status = 'scheduled');

drop policy if exists "appointments_admin_all" on public.appointments;
create policy "appointments_admin_all"
  on public.appointments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
--  CÓMO CREAR EL ADMINISTRADOR (hazlo una vez)
-- ============================================================================
--  1) En Supabase: Authentication -> Users -> "Add user" (email + password).
--  2) Copia el UID del usuario creado.
--  3) Ejecuta (reemplazando el UID y el nombre):
--
--     insert into public.admins (id, full_name)
--     values ('PEGA-AQUI-EL-UID', 'Dueño Barbería');
--
--  A partir de ahí, ese usuario podrá entrar en /admin/login.
-- ============================================================================

-- ============================================================================
--  DATOS DE EJEMPLO (opcional — descomenta para probar la web pública)
-- ============================================================================
-- insert into public.services (name, description, duration_minutes, price) values
--   ('Corte clásico', 'Corte de cabello a máquina y tijera', 30, 12.00),
--   ('Corte + barba', 'Corte completo y arreglo de barba', 45, 18.00),
--   ('Afeitado tradicional', 'Afeitado a navaja con toalla caliente', 30, 10.00);
