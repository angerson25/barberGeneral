import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Landing pública de la plataforma (acceso para todos, sin auth).
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">
          Barber<span className="text-brand-accent">SaaS</span>
        </span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Iniciar sesión
          </Link>
          <Link href="/register">
            <Button>Crear cuenta</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Gestiona tu barbería sin complicaciones
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Reservas online, agenda, clientes y servicios en un solo lugar.
          Multi-barbería, listo para crecer.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register">
            <Button className="px-6 py-3">Empezar gratis</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-6 py-3">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {[
          ["Reservas online", "Página pública por barbería para que tus clientes reserven solos."],
          ["Agenda clara", "Visualiza tus citas del día, próximos turnos y estados."],
          ["Clientes y servicios", "Administra tu cartera de clientes y tu catálogo de servicios."],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
