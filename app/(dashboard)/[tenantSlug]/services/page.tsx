import { redirect } from "next/navigation";
import { getTenantAccess } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import { createServiceAction, deleteServiceAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Service } from "@/lib/types";

// CRUD básico de servicios. Solo el owner ve el formulario de alta.
export default async function ServicesPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const access = await getTenantAccess(params.tenantSlug);
  if (!access) redirect("/login");
  const slug = params.tenantSlug;
  const isOwner = access.membership.role === "owner";

  const supabase = createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", access.tenant.id)
    .order("created_at", { ascending: false });

  const services = (data ?? []) as Service[];

  const create = createServiceAction.bind(null, slug);
  const remove = deleteServiceAction.bind(null, slug);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Servicios</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {isOwner && (
          <div className="md:col-span-1">
            <Card>
              <CardTitle>Nuevo servicio</CardTitle>
              <form action={create} className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Corte + barba" required />
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Duración (min)</Label>
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min={5}
                    step={5}
                    defaultValue={30}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={0}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Guardar
                </Button>
              </form>
            </Card>
          </div>
        )}

        <div className={isOwner ? "md:col-span-2" : "md:col-span-3"}>
          <Card>
            <CardTitle>Catálogo ({services.length})</CardTitle>
            {services.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay servicios.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-gray-500">
                        {s.duration_minutes} min · ${Number(s.price).toFixed(2)}
                      </p>
                    </div>
                    {isOwner && (
                      <form action={remove}>
                        <input type="hidden" name="id" value={s.id} />
                        <Button variant="danger" className="px-2 py-1 text-xs">
                          Eliminar
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
