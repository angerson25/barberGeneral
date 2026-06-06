import { createClient } from "@/lib/supabase/server";
import { createClientAction, deleteClientAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Client } from "@/lib/types";

// CRUD básico de clientes.
export default async function ClientsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  const clients = (data ?? []) as Client[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Clientes</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardTitle>Nuevo cliente</CardTitle>
            <form action={createClientAction} className="space-y-3">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" />
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <Button type="submit" className="w-full">
                Guardar
              </Button>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardTitle>Listado ({clients.length})</CardTitle>
            {clients.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay clientes.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {clients.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-gray-500">
                        {c.phone || "Sin teléfono"}
                        {c.notes ? ` · ${c.notes}` : ""}
                      </p>
                    </div>
                    <form action={deleteClientAction}>
                      <input type="hidden" name="id" value={c.id} />
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
