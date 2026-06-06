-- ============================================================================
--  Barber SaaS — Esquema multi-tenant para Supabase (PostgreSQL)
-- ============================================================================
--  Ejecuta este script en el SQL Editor de Supabase (o vía `supabase db push`).
--
--  Modelo multi-tenant:
--    - Cada barbería es un "tenant" (tabla `tenants`).
--    - Toda tabla de negocio lleva `tenant_id`.
--    - El acceso se aísla por tenant mediante RLS + la tabla `memberships`,
--      que relaciona un usuario autenticado (auth.users) con un tenant y un rol.
--    - La identificación pública del tenant se hace por `tenants.slug`
--      (usado en la URL: /b/[tenantSlug] o [tenantSlug]/dashboard).
-- ============================================================================

-- Extensiones útiles --------------------------------------------------------
create extension if not exists "pgcrypto";  -- para gen_random_uuid()

-- ============================================================================
--  TABLAS
-- ============================================================================

-- tenants: cada barbería ----------------------------------------------------
create table if not exists public.tenants (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,          -- identificador en la URL
  created_at timestamptz not null default now()
);

-- profiles: extiende auth.users ---------------------------------------------
-- El id es el MISMO que auth.users.id (relación 1:1).
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now()
);

-- memberships: relaciona un usuario con una barbería y su rol ---------------
create table if not exists public.memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  role       text not null default 'barber' check (role in ('owner', 'barber')),
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);

-- clients: clientes de cada barbería ----------------------------------------
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  phone      text,
  notes      text,
  created_at timestamptz not null default now()
);

-- services: servicios (corte, barba, combos...) -----------------------------
create table if not exists public.services (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  name             text not null,
  duration_minutes int not null default 30 check (duration_minutes > 0),
  price            numeric(10, 2) not null default 0 check (price >= 0),
  created_at       timestamptz not null default now()
);

-- appointments: citas / reservas --------------------------------------------
create table if not exists public.appointments (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  client_id   uuid references public.clients(id) on delete set null,
  service_id  uuid references public.services(id) on delete set null,
  barber_id   uuid references public.profiles(id) on delete set null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  status      text not null default 'scheduled'
              check (status in ('scheduled', 'completed', 'no_show', 'cancelled')),
  created_at  timestamptz not null default now()
);

-- Índices para consultas frecuentes por tenant ------------------------------
create index if not exists idx_memberships_tenant on public.memberships(tenant_id);
create index if not exists idx_memberships_user   on public.memberships(user_id);
create index if not exists idx_clients_tenant      on public.clients(tenant_id);
create index if not exists idx_services_tenant     on public.services(tenant_id);
create index if not exists idx_appointments_tenant on public.appointments(tenant_id);
create index if not exists idx_appointments_start  on public.appointments(tenant_id, start_time);

-- ============================================================================
--  FUNCIONES AUXILIARES (helper functions para RLS)
-- ============================================================================
-- Mantener la lógica de pertenencia en funciones SECURITY DEFINER evita
-- recursión de políticas y centraliza la comprobación de tenant/rol.

-- ¿El usuario actual es miembro de este tenant? -----------------------------
create or replace function public.is_member_of(p_tenant_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.tenant_id = p_tenant_id
      and m.user_id = auth.uid()
  );
$$;

-- ¿El usuario actual es OWNER de este tenant? -------------------------------
create or replace function public.is_owner_of(p_tenant_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.memberships m
    where m.tenant_id = p_tenant_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

-- ============================================================================
--  TRIGGER: crear profile automáticamente al registrarse un usuario
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
--  ROW LEVEL SECURITY
-- ============================================================================
alter table public.tenants     enable row level security;
alter table public.profiles    enable row level security;
alter table public.memberships enable row level security;
alter table public.clients     enable row level security;
alter table public.services    enable row level security;
alter table public.appointments enable row level security;

-- ---------------------------------------------------------------------------
--  TENANTS
-- ---------------------------------------------------------------------------
-- Lectura pública del tenant (necesaria para la página pública de reservas
-- /b/[slug], donde el visitante no está autenticado). Solo expone name/slug.
drop policy if exists "tenants_public_read" on public.tenants;
create policy "tenants_public_read"
  on public.tenants for select
  using (true);

-- Cualquier usuario autenticado puede crear una barbería (se vuelve owner
-- vía server action que inserta el membership). 
drop policy if exists "tenants_insert_authenticated" on public.tenants;
create policy "tenants_insert_authenticated"
  on public.tenants for insert to authenticated
  with check (true);

-- Solo el owner puede actualizar/borrar su barbería.
drop policy if exists "tenants_update_owner" on public.tenants;
create policy "tenants_update_owner"
  on public.tenants for update to authenticated
  using (public.is_owner_of(id))
  with check (public.is_owner_of(id));

drop policy if exists "tenants_delete_owner" on public.tenants;
create policy "tenants_delete_owner"
  on public.tenants for delete to authenticated
  using (public.is_owner_of(id));

-- ---------------------------------------------------------------------------
--  PROFILES
-- ---------------------------------------------------------------------------
-- Cada usuario gestiona solo su propio perfil.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
--  MEMBERSHIPS
-- ---------------------------------------------------------------------------
-- El usuario ve sus propias membresías (para saber a qué tenants pertenece).
drop policy if exists "memberships_select_own" on public.memberships;
create policy "memberships_select_own"
  on public.memberships for select to authenticated
  using (user_id = auth.uid());

-- Insertar membership: o bien es la primera (te conviertes en owner de un
-- tenant que acabas de crear), o un owner del tenant invita a otro usuario.
drop policy if exists "memberships_insert" on public.memberships;
create policy "memberships_insert"
  on public.memberships for insert to authenticated
  with check (
    user_id = auth.uid()              -- te unes a ti mismo (creación inicial)
    or public.is_owner_of(tenant_id)  -- un owner agrega a otro barbero
  );

-- Solo el owner del tenant puede modificar/eliminar membresías.
drop policy if exists "memberships_update_owner" on public.memberships;
create policy "memberships_update_owner"
  on public.memberships for update to authenticated
  using (public.is_owner_of(tenant_id))
  with check (public.is_owner_of(tenant_id));

drop policy if exists "memberships_delete_owner" on public.memberships;
create policy "memberships_delete_owner"
  on public.memberships for delete to authenticated
  using (public.is_owner_of(tenant_id));

-- ---------------------------------------------------------------------------
--  CLIENTS  (cualquier miembro del tenant gestiona los clientes)
-- ---------------------------------------------------------------------------
drop policy if exists "clients_select_member" on public.clients;
create policy "clients_select_member"
  on public.clients for select to authenticated
  using (public.is_member_of(tenant_id));

drop policy if exists "clients_insert_member" on public.clients;
create policy "clients_insert_member"
  on public.clients for insert to authenticated
  with check (public.is_member_of(tenant_id));

drop policy if exists "clients_update_member" on public.clients;
create policy "clients_update_member"
  on public.clients for update to authenticated
  using (public.is_member_of(tenant_id))
  with check (public.is_member_of(tenant_id));

drop policy if exists "clients_delete_member" on public.clients;
create policy "clients_delete_member"
  on public.clients for delete to authenticated
  using (public.is_member_of(tenant_id));

-- Inserción anónima de clientes desde la reserva pública /b/[slug]/book.
-- Permite registrar el nombre/teléfono del visitante al reservar.
-- NOTA: para producción restringe esto (captcha / rate limit / service role).
drop policy if exists "clients_insert_public" on public.clients;
create policy "clients_insert_public"
  on public.clients for insert to anon
  with check (true);

-- ---------------------------------------------------------------------------
--  SERVICES  (lectura pública para la página de reservas; escritura: owner)
-- ---------------------------------------------------------------------------
-- Lectura pública: los clientes finales necesitan ver los servicios para
-- reservar en /b/[slug]/book.
drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
  on public.services for select
  using (true);

-- Solo el OWNER del tenant puede crear/editar/borrar servicios.
drop policy if exists "services_insert_owner" on public.services;
create policy "services_insert_owner"
  on public.services for insert to authenticated
  with check (public.is_owner_of(tenant_id));

drop policy if exists "services_update_owner" on public.services;
create policy "services_update_owner"
  on public.services for update to authenticated
  using (public.is_owner_of(tenant_id))
  with check (public.is_owner_of(tenant_id));

drop policy if exists "services_delete_owner" on public.services;
create policy "services_delete_owner"
  on public.services for delete to authenticated
  using (public.is_owner_of(tenant_id));

-- ---------------------------------------------------------------------------
--  APPOINTMENTS
-- ---------------------------------------------------------------------------
-- Lectura: solo miembros del tenant ven la agenda interna.
drop policy if exists "appointments_select_member" on public.appointments;
create policy "appointments_select_member"
  on public.appointments for select to authenticated
  using (public.is_member_of(tenant_id));

-- Inserción interna (panel): miembro del tenant.
drop policy if exists "appointments_insert_member" on public.appointments;
create policy "appointments_insert_member"
  on public.appointments for insert to authenticated
  with check (public.is_member_of(tenant_id));

-- Reservas públicas (cliente final NO autenticado) desde /b/[slug]/book.
-- Se permite crear cita en estado 'scheduled' para cualquier tenant existente.
-- NOTA: en producción conviene restringir esto con un endpoint server-side
-- (service role) o validación adicional anti-spam. Aquí queda como base.
drop policy if exists "appointments_insert_public" on public.appointments;
create policy "appointments_insert_public"
  on public.appointments for insert to anon
  with check (status = 'scheduled');

-- Actualizar/borrar citas: solo miembros del tenant.
drop policy if exists "appointments_update_member" on public.appointments;
create policy "appointments_update_member"
  on public.appointments for update to authenticated
  using (public.is_member_of(tenant_id))
  with check (public.is_member_of(tenant_id));

drop policy if exists "appointments_delete_member" on public.appointments;
create policy "appointments_delete_member"
  on public.appointments for delete to authenticated
  using (public.is_member_of(tenant_id));

-- ============================================================================
--  DATOS DE EJEMPLO (opcional — descomenta para probar)
-- ============================================================================
-- insert into public.tenants (name, slug) values ('Barbería Demo', 'barberia-demo');
