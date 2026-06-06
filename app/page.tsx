import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "@/components/BookingForm";
import type { Service } from "@/lib/types";

// ============================================================================
//  Web pública de LA barbería (sin login). Es la página principal del sitio:
//  presentación + lista de servicios + formulario de reserva online.
//  El diseño usa los colores configurados en `settings` (personalizables).
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

  const primary = settings.primary_color ?? "#111827";
  const accent = settings.accent_color ?? "#f59e0b";

  return (
    <main className="min-h-screen">
      {/* Barra superior */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: primary, color: "white" }}
      >
        <span className="text-lg font-bold">{settings.name}</span>
        <div className="flex items-center gap-4 text-sm">
          <a href="#reservar" className="hover:underline">
            Reservar
          </a>
          {settings.instagram && (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Instagram
            </a>
          )}
        </div>
      </header>

      {/* Hero */}
      <section
        className="px-6 py-20 text-center text-white"
        style={{ backgroundColor: primary }}
      >
        <h1 className="text-4xl font-bold sm:text-5xl">{settings.name}</h1>
        {settings.tagline && (
          <p className="mt-3 text-lg opacity-90">{settings.tagline}</p>
        )}
        <a
          href="#reservar"
          className="mt-8 inline-block rounded-md px-6 py-3 font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          Reservar turno
        </a>
        {(settings.phone || settings.address) && (
          <p className="mt-6 text-sm opacity-80">
            {settings.phone && <>📞 {settings.phone}</>}
            {settings.phone && settings.address && " · "}
            {settings.address && <>📍 {settings.address}</>}
          </p>
        )}
      </section>

      {/* Sobre la barbería */}
      {settings.about && (
        <section className="mx-auto max-w-3xl px-6 py-12 text-center">
          <p className="text-gray-700">{settings.about}</p>
        </section>
      )}

      {/* Servicios */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="mb-6 text-center text-2xl font-bold">Servicios</h2>
        {services.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            Aún no hay servicios publicados.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5"
              >
                <div>
                  <p className="font-semibold">{s.name}</p>
                  {s.description && (
                    <p className="text-sm text-gray-500">{s.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {s.duration_minutes} min
                  </p>
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: accent }}
                >
                  ${Number(s.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reserva */}
      <section id="reservar" className="bg-gray-100 px-6 py-16">
        <div className="mx-auto max-w-md">
          <h2 className="mb-6 text-center text-2xl font-bold">Reserva tu turno</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <BookingForm services={services} accentColor={accent} />
          </div>
        </div>
      </section>

      {/* Pie */}
      <footer
        className="px-6 py-8 text-center text-sm text-white"
        style={{ backgroundColor: primary }}
      >
        <p>{settings.name}</p>
        {settings.opening_hours && (
          <p className="mt-1 opacity-80">🕒 {settings.opening_hours}</p>
        )}
        <p className="mt-4 opacity-60">
          <Link href="/admin" className="hover:underline">
            Acceso panel
          </Link>
        </p>
      </footer>
    </main>
  );
}
