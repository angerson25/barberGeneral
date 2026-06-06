import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/BookingForm";
import type { Service } from "@/lib/types";

// ============================================================================
//  Web pública de LA barbería (sin login). Página principal del sitio:
//  presentación + servicios + reserva online. Diseño FUTURISTA (dark + neón).
//  El color de acento se toma de `settings` (personalizable desde el panel).
//  NOTA: el panel de administración NO se enlaza aquí; solo el dueño conoce /admin.
// ============================================================================
export default async function HomePage() {
  const settings = await getSettings();

  const supabase = createClient();
  const { data } = await supabase
    .from("services")
    .select("id, name, description, duration_minutes, price")
    .eq("active", true)
    .order("price", { ascending: true });

  const services = (data ?? []) as Pick<
    Service,
    "id" | "name" | "description" | "duration_minutes" | "price"
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
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet text-sm font-black text-ink-900">
              {settings.name.charAt(0).toUpperCase()}
            </span>
            <span className="text-base font-semibold tracking-tight">
              {settings.name}
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <a href="#servicios" className="hidden hover:text-white sm:block">
              Servicios
            </a>
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="hidden hover:text-white sm:block"
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
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon-cyan" />
            Reserva tu turno en segundos
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
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

          {(settings.phone || settings.address || settings.opening_hours) && (
            <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
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

        {/* Reserva */}
        <section id="reservar" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-lg">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Reserva tu turno
              </h2>
              <p className="mt-2 text-slate-400">
                Completa tus datos y elige el horario.
              </p>
            </div>
            <div className="gradient-border rounded-2xl bg-ink-700/70 p-8 shadow-glow-violet backdrop-blur">
              <BookingForm services={services} accentColor={accent} />
            </div>
          </div>
        </section>

        {/* Pie */}
        <footer className="border-t border-white/5 px-6 py-10 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-300">{settings.name}</p>
          {settings.opening_hours && (
            <p className="mt-1">🕒 {settings.opening_hours}</p>
          )}
          <p className="mt-4 text-xs text-slate-600">
            © {new Date().getFullYear()} {settings.name}. Todos los derechos
            reservados.
          </p>
        </footer>
      </div>
    </main>
  );
}
