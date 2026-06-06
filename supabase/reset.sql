-- ============================================================================
--  RESET LIMPIO — Barbería single-tenant
-- ============================================================================
--  Úsalo SOLO si tu base tiene restos del modelo antiguo (SaaS multi-tenant)
--  y prefieres empezar de cero. BORRA TODAS las tablas de la app y sus datos.
--
--  Pasos:
--    1) Ejecuta TODO este archivo en Supabase -> SQL Editor.
--    2) Luego ejecuta el archivo `schema.sql` completo.
--    3) Vuelve a insertar tu admin (ver el final de schema.sql).
--
--  NOTA: NO toca auth.users (tu usuario admin de Authentication se conserva),
--  solo borra las tablas de datos de la aplicación.
-- ============================================================================

-- Borra tablas de la app (y sus políticas/constraints) en cascada.
-- Incluye tanto las tablas nuevas como las heredadas del modelo SaaS.
drop table if exists public.appointments cascade;
drop table if exists public.services      cascade;
drop table if exists public.barbers       cascade;
drop table if exists public.clients       cascade;
drop table if exists public.settings      cascade;
drop table if exists public.admins        cascade;

-- Tablas heredadas del antiguo modelo multi-tenant (si existieran).
drop table if exists public.memberships   cascade;
drop table if exists public.profiles       cascade;
drop table if exists public.tenants        cascade;

-- Funciones heredadas/actuales (se recrean en schema.sql).
drop function if exists public.is_admin() cascade;

-- Refresca la caché del API.
notify pgrst, 'reload schema';

-- ============================================================================
--  AHORA ejecuta `schema.sql` para crear el esquema limpio.
-- ============================================================================
