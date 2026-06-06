import Link from "next/link";
import { redirect } from "next/navigation";
import { getTenantAccess } from "@/lib/tenant";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

// ============================================================================
//  Layout del panel interno por tenant: /[tenantSlug]/...
//  Multi-tenant gate: resuelve el tenant por slug y verifica que el usuario
//  autenticado tenga membership. Si no, redirige (no se muestra contenido).
// ============================================================================
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const access = await getTenantAccess(params.tenantSlug);

  // Sin sesión o sin acceso al tenant -> fuera.
  if (!access) {
    redirect("/login?error=Sin+acceso+a+esta+barberia");
  }

  const { tenant, membership } = access;
  const base = `/${tenant.slug}`;

  const nav = [
    { href: `${base}/dashboard`, label: "Inicio" },
    { href: `${base}/appointments`, label: "Citas" },
    { href: `${base}/clients`, label: "Clientes" },
    { href: `${base}/services`, label: "Servicios" },
  ];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-gray-200 bg-white p-4 md:block">
        <div className="mb-6">
          <p className="text-sm font-bold">{tenant.name}</p>
          <p className="text-xs text-gray-500">/{tenant.slug}</p>
          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs">
            {membership.role}
          </span>
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
            href={`/b/${tenant.slug}/book`}
            target="_blank"
            className="block text-xs text-brand underline"
          >
            Ver página pública de reservas ↗
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
