import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { logoutAction } from "../login/actions";
import { Button } from "@/components/ui/Button";

// ============================================================================
//  Layout del panel de administración (/admin/...).
//  Gate: solo usuarios presentes en `admins` pueden entrar; si no, al login.
//  El grupo (panel) hace que este gate NO afecte a /admin/login.
// ============================================================================
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/admin/login");
  }

  const settings = await getSettings();

  const nav = [
    { href: "/admin", label: "Inicio" },
    { href: "/admin/appointments", label: "Citas" },
    { href: "/admin/clients", label: "Clientes" },
    { href: "/admin/services", label: "Servicios" },
    { href: "/admin/barbers", label: "Barberos" },
    { href: "/admin/settings", label: "Configuración" },
  ];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-gray-200 bg-white p-4 md:block">
        <div className="mb-6">
          <p className="text-sm font-bold">{settings.name}</p>
          <p className="text-xs text-gray-500">Panel de administración</p>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-gray-200 pt-4">
          <Link
            href="/"
            target="_blank"
            className="block text-xs text-brand underline"
          >
            Ver la web pública ↗
          </Link>
          <form action={logoutAction} className="mt-3">
            <Button variant="secondary" className="w-full">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      <main className="md:pl-60">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
