import Link from "next/link";
import { loginAction } from "./actions";

// Página de acceso al panel (solo administradores). No hay registro público.
// Solo el dueño conoce esta URL; no se enlaza desde la web pública.
export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="theme-future relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 bg-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-neon-violet/20 blur-[120px] animate-pulse-glow" />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 block text-center text-sm text-slate-400 transition hover:text-white"
        >
          ← Volver a la web
        </Link>

        <div className="gradient-border rounded-2xl bg-ink-700/70 p-8 shadow-glow-violet backdrop-blur">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet text-lg font-black text-ink-900">
              ✦
            </span>
            <h1 className="text-xl font-bold text-white">Acceso al panel</h1>
            <p className="mt-1 text-xs text-slate-400">
              Solo administradores autorizados.
            </p>
          </div>

          {searchParams.error && (
            <p className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 p-2.5 text-sm text-red-300">
              {searchParams.error}
            </p>
          )}

          <form action={loginAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-dark"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-dark"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet px-5 py-3 text-sm font-semibold text-ink-900 shadow-glow transition hover:scale-[1.02]"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
