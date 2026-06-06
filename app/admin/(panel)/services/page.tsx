import { createClient } from "@/lib/supabase/server";
import { createServiceAction, deleteServiceAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Service } from "@/lib/types";

// CRUD básico de servicios.
export default async function ServicesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  const services = (data ?? []) as Service[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Servicios</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardTitle>Nuevo servicio</CardTitle>
            <form action={createServiceAction} className="space-y-3">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Corte + barba" required />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" rows={2} />
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

        <div className="md:col-span-2">
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
                        {s.description ? ` · ${s.description}` : ""}
                      </p>
                    </div>
                    <form action={deleteServiceAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button variant="danger" className="px-2 py-1 text-xs">
                        Eliminar
                      </Button>
                    </form>
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
