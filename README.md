# BarberSaaS — SaaS multi-tenant para barberías

Esqueleto funcional con **Next.js 14 (App Router) + Supabase + Tailwind CSS**, listo para deploy en **Vercel + Supabase**.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS) con `@supabase/ssr`

## Multi-tenant

- Cada barbería es un **tenant** (`tenants`).
- Toda tabla de negocio lleva `tenant_id`.
- El tenant se identifica por **slug** en la URL:
  - Panel interno: `/{tenantSlug}/dashboard`
  - Reserva pública: `/b/{tenantSlug}/book`
- Aislamiento real por **RLS** + tabla `memberships` (usuario ↔ tenant ↔ rol).
- Preparado para migrar a subdominios (`barberiaX.midominio.com`) más adelante.

## Puesta en marcha

1. **Instala dependencias**
   ```bash
   npm install
   ```

2. **Crea un proyecto en Supabase** y copia las claves a `.env`:
   ```bash
   cp .env.example .env
   ```
   Rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Supabase → Settings → API).

3. **Aplica el esquema y las políticas RLS**
   Abre `supabase/schema.sql` y ejecútalo en el **SQL Editor** de Supabase.

4. **Arranca en local**
   ```bash
   npm run dev
   ```
   Abre http://localhost:3000

## Flujo de uso

1. `/register` → crea cuenta (el trigger crea el `profile`).
2. `/login` → inicia sesión.
3. `/select-tenant` → crea tu barbería (te vuelves `owner`) o entra a una existente.
4. `/{slug}/dashboard` → panel con KPIs, citas de hoy y próximos turnos.
5. `/{slug}/clients`, `/{slug}/services`, `/{slug}/appointments` → gestión.
6. `/b/{slug}/book` → página pública para que los clientes reserven.

## Estructura

```
app/
  page.tsx                       # Landing pública
  (auth)/login | register        # Auth Supabase
  select-tenant/                 # Elegir/crear barbería tras login
  (dashboard)/[tenantSlug]/      # Panel interno (gate de membership)
    dashboard | clients | services | appointments
  b/[tenantSlug]/book/           # Reservas públicas
  auth/callback/                 # Callback de Supabase Auth
lib/
  supabase/ (server|client|middleware)
  tenant.ts                      # Resolución de tenant + verificación de acceso
  types.ts
components/ui/                   # Botones, inputs, cards
supabase/schema.sql              # Tablas + RLS
```

## Notas (siguientes iteraciones)

- Pagos: agregar tabla `payments` + integración (Stripe/Mercado Pago).
- Recordatorios: WhatsApp/email con un cron (Vercel Cron / Supabase Edge Functions).
- Reservas públicas: añadir captcha + rate limit y/o endpoint con service role.
- Subdominios: resolver tenant desde `host` en `middleware.ts`.
