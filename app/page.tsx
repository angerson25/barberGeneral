import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/BookingForm";
import type { Barber, Service } from "@/lib/types";

// ============================================================================
//  Web pública de LA barbería (sin login). Página principal del sitio:
//  presentación + servicios + reserva online. Diseño FUTURISTA (dark + neón).
//  El color de acento se toma de `settings` (personalizable desde el panel).
//  NOTA: el panel de administración NO se enlaza aquí; solo el dueño conoce /admin.
// ============================================================================
export default async function HomePage() {
  const settings = await getSettings();

  const supabase = createClient();
  const [{ data: serviceData }, { data: barberData }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, description, duration_minutes, price")
      .eq("active", true)
      .order("price", { ascending: true }),
    supabase
      .from("barbers")
      .select("id, name, bio, specialty, avatar_url")
      .eq("active", true)
      .order("created_at", { ascending: true }),
  ]);

  const services = (serviceData ?? []) as Pick<
    Service,
    "id" | "name" | "description" | "duration_minutes" | "price"
  >[];

  const barbers = (barberData ?? []) as Pick<
    Barber,
    "id" | "name" | "bio" | "specialty" | "avatar_url"
  >[];

  const accent = settings.accent_color ?? "#22d3ee";

  return (
    <main className="theme-future relative min-h-screen overflow-hidden">
      {/* Capas de fondo */}
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-neon-cyan/20 blur-[120px] animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-neon-violet/20 blur-[120px] animate-pulse-glow" />

      <div className="relative">
        {/* Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-900/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet text-sm font-black text-ink-900 shadow-glow">
                {settings.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-display text-base font-semibold tracking-tight">
                {settings.name}
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-slate-300">
              <a href="#servicios" className="hidden transition hover:text-white sm:block">
                Servicios
              </a>
              <a href="#equipo" className="hidden transition hover:text-white sm:block">
                Equipo
              </a>
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden transition hover:text-white sm:block"
                >
                  Instagram
                </a>
              )}
              <a
                href="#reservar"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-medium text-white backdrop-blur transition hover:bg-white/10"
              >
                Reservar
              </a>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon-cyan" />
            Reserva tu turno en segundos
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
            <span className="text-gradient animate-gradient-pan">
              {settings.name}
            </span>
          </h1>
          {settings.tagline && (
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
              {settings.tagline}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#reservar"
              className="group relative overflow-hidden rounded-full px-7 py-3 text-sm font-semibold text-ink-900 shadow-glow transition hover:scale-[1.03]"
              style={{ backgroundColor: accent }}
            >
              Reservar turno
            </a>
            <a
              href="#servicios"
              className="rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Ver servicios
            </a>
          </div>

          {/* Barra de confianza */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-5 backdrop-blur">
            <div className="px-4">
              <p className="font-display text-2xl font-black text-white">
                {services.length || "—"}
              </p>
              <p className="mt-1 text-xs text-slate-400">Servicios</p>
            </div>
            <div className="px-4">
              <p className="font-display text-2xl font-black text-white">
                {barbers.length || "—"}
              </p>
              <p className="mt-1 text-xs text-slate-400">Barberos</p>
            </div>
            <div className="px-4">
              <p className="font-display text-2xl font-black text-white">24/7</p>
              <p className="mt-1 text-xs text-slate-400">Reserva online</p>
            </div>
          </div>

          {(settings.phone || settings.address || settings.opening_hours) && (
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {settings.phone && <span>📞 {settings.phone}</span>}
              {settings.address && <span>📍 {settings.address}</span>}
              {settings.opening_hours && <span>🕒 {settings.opening_hours}</span>}
            </div>
          )}
        </section>

        {/* Sobre la barbería */}
        {settings.about && (
          <section className="mx-auto max-w-3xl px-6 pb-8">
            <div className="glass rounded-2xl p-8 text-center text-slate-300">
              {settings.about}
            </div>
          </section>
        )}

        {/* Servicios */}
        <section id="servicios" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-10 text-center">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              Carta
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestros servicios
            </h2>
            <p className="mt-2 text-slate-400">
              Elige el que prefieras y reserva al instante.
            </p>
          </div>

          {services.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Aún no hay servicios publicados.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="gradient-border group relative rounded-2xl bg-ink-700/60 p-6 backdrop-blur transition hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                    <span
                      className="whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold text-ink-900"
                      style={{ backgroundColor: accent }}
                    >
                      ${Number(s.price).toFixed(2)}
                    </span>
                  </div>
                  {s.description && (
                    <p className="mt-2 text-sm text-slate-400">{s.description}</p>
                  )}
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
                    {s.duration_minutes} min
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Equipo / barberos */}
        {barbers.length > 0 && (
          <section id="equipo" className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-10 text-center">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                Profesionales
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Nuestro equipo
              </h2>
              <p className="mt-2 text-slate-400">
                Profesionales para cada estilo.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {barbers.map((b) => (
                <div
                  key={b.id}
                  className="glass group rounded-2xl p-6 text-center transition hover:-translate-y-1"
                >
                  <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full ring-2 ring-white/10">
                    {b.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.avatar_url}
                        alt={b.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="grid h-full w-full place-items-center text-2xl font-black text-ink-900"
                        style={{ backgroundColor: accent }}
                      >
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{b.name}</h3>
                  {b.specialty && (
                    <p
                      className="mt-1 text-sm font-medium"
                      style={{ color: accent }}
                    >
                      {b.specialty}
                    </p>
                  )}
                  {b.bio && (
                    <p className="mt-2 text-sm text-slate-400">{b.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reserva */}
        <section id="reservar" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: accent }}
              >
                Reserva online
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Reserva tu turno
              </h2>
              <p className="mt-2 text-slate-400">
                Elige barbero, servicio, día y hora.
              </p>
            </div>
            <div className="gradient-border rounded-2xl bg-ink-700/70 p-6 shadow-glow-violet backdrop-blur sm:p-8">
              <BookingForm
                services={services}
                barbers={barbers}
                accentColor={accent}
                openTime={settings.open_time ?? "09:00"}
                closeTime={settings.close_time ?? "20:00"}
                slotMinutes={settings.slot_minutes ?? 30}
              />
            </div>
          </div>
        </section>

        {/* Pie */}
        <footer className="border-t border-white/5 bg-ink-900/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet text-sm font-black text-ink-900">
                  {settings.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-display text-base font-semibold text-white">
                  {settings.name}
                </span>
              </div>
              {settings.tagline && (
                <p className="mt-3 max-w-xs text-sm text-slate-400">
                  {settings.tagline}
                </p>
              )}
            </div>

            <div className="text-sm text-slate-400">
              <p className="mb-3 font-semibold uppercase tracking-wide text-slate-500">
                Contacto
              </p>
              <ul className="space-y-1.5">
                {settings.phone && <li>📞 {settings.phone}</li>}
                {settings.address && <li>📍 {settings.address}</li>}
                {settings.opening_hours && <li>🕒 {settings.opening_hours}</li>}
              </ul>
            </div>

            <div className="text-sm text-slate-400">
              <p className="mb-3 font-semibold uppercase tracking-wide text-slate-500">
                Enlaces
              </p>
              <ul className="space-y-1.5">
                <li>
                  <a href="#servicios" className="transition hover:text-white">
                    Servicios
                  </a>
                </li>
                <li>
                  <a href="#equipo" className="transition hover:text-white">
                    Equipo
                  </a>
                </li>
                <li>
                  <a href="#reservar" className="transition hover:text-white">
                    Reservar turno
                  </a>
                </li>
                {settings.instagram && (
                  <li>
                    <a
                      href={settings.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="transition hover:text-white"
                    >
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 px-6 py-6 text-center text-xs text-slate-600">
            © {new Date().getFullYear()} {settings.name}. Todos los derechos
            reservados.
          </div>
        </footer>
      </div>
    </main>
  );
}
