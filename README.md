# Barbería — Web + Panel (Next.js 14 + Supabase)

Web pública de **una sola barbería** con reservas online (sin login para clientes)
y un **panel de administración** protegido para el dueño/barbero.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS) con `@supabase/ssr`

## Cómo funciona

- **`/`** → Web pública: presentación, servicios y formulario de reserva. **Sin login.**
- **`/admin/login`** → Acceso del administrador (no hay registro público).
- **`/admin`** → Panel: inicio (KPIs), citas, clientes, servicios y configuración.

El diseño (nombre, colores, textos) se edita desde **`/admin/settings`** y se guarda
en la tabla `settings`.

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
   (Supabase → Project Settings → API → *Project URL* y *anon public*).

3. **Aplica el esquema y RLS**
   Ejecuta `supabase/schema.sql` en el **SQL Editor** de Supabase.

4. **Crea el administrador** (una sola vez):
   - Supabase → Authentication → Users → **Add user** (email + contraseña).
   - Copia el **UID** del usuario y ejecuta en el SQL Editor:
     ```sql
     insert into public.admins (id, full_name)
     values ('PEGA-AQUI-EL-UID', 'Dueño Barbería');
     ```

5. **Arranca**
   ```bash
   npm run dev
   ```
   - Web pública: http://localhost:3000
   - Panel: http://localhost:3000/admin/login

## Estructura

```
app/
  page.tsx                 # Web pública (servicios + reserva)
  actions.ts               # Server Action de reserva pública
  admin/
    login/                 # Acceso del admin (sin registro)
    (panel)/               # Panel protegido (gate de admin)
      page.tsx             # Inicio / KPIs
      appointments/        # Agenda
      clients/             # Clientes
      services/            # Servicios
      settings/            # Configuración y diseño
  auth/callback/           # Callback de Supabase Auth
components/
  BookingForm.tsx          # Formulario de reserva pública
  ui/                      # Botones, inputs, cards
lib/
  supabase/ (server|client|middleware)
  auth.ts                  # getAdminUser() — verificación de administrador
  settings.ts              # getSettings() — config de la barbería
  types.ts
supabase/schema.sql        # Tablas + RLS (single-tenant)
```

## Seguridad (RLS)

- `services` y `settings`: lectura pública; escritura solo administradores.
- `clients` y `appointments`: inserción pública (reserva online); el resto solo admin.
- `is_admin()` comprueba que el usuario esté en la tabla `admins`.

## Siguientes pasos (no incluidos aún)

- Pagos (Stripe / Mercado Pago).
- Recordatorios por WhatsApp / email.
- Anti-spam en la reserva pública (captcha + rate limit).
- Validación de disponibilidad/horarios al reservar.
