import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTenantAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Membership, Tenant } from "@/lib/types";

// Tras iniciar sesión: el usuario elige una de sus barberías o crea una nueva.
export default async function SelectTenantPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Trae las membresías del usuario junto con el tenant (RLS limita a las suyas).
  const { data } = await supabase
    .from("memberships")
    .select("*, tenant:tenants(*)")
    .eq("user_id", user.id);

  const memberships = (data ?? []) as (Membership & { tenant: Tenant })[];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">Tus barberías</h1>

      {searchParams.error && (
        <p className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <div className="mb-8 grid gap-3">
        {memberships.length === 0 && (
          <p className="text-sm text-gray-600">
            Aún no perteneces a ninguna barbería. Crea la primera abajo.
          </p>
        )}
        {memberships.map((m) => (
          <Link
            key={m.id}
            href={`/${m.tenant.slug}/dashboard`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-brand"
          >
            <div>
              <p className="font-medium">{m.tenant.name}</p>
              <p className="text-xs text-gray-500">/{m.tenant.slug}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
              {m.role}
            </span>
          </Link>
        ))}
      </div>

      <Card>
        <CardTitle>Crear nueva barbería</CardTitle>
        <form action={createTenantAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" type="text" placeholder="Barbería El Corte" required />
          </div>
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" name="slug" type="text" placeholder="barberia-el-corte" />
            <p className="mt-1 text-xs text-gray-500">
              Se usará en la URL pública: /b/&lt;slug&gt;/book
            </p>
          </div>
          <Button type="submit">Crear y entrar</Button>
        </form>
      </Card>
    </div>
  );
}
