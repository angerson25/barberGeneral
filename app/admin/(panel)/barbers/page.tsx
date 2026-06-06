import { createClient } from "@/lib/supabase/server";
import {
  createBarberAction,
  deleteBarberAction,
  updateBarberAction,
} from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Barber } from "@/lib/types";

// CRUD de barberos con su comisión (%).
export default async function BarbersPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("barbers")
    .select("*")
    .order("created_at", { ascending: true });

  const barbers = (data ?? []) as Barber[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Barberos</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardTitle>Nuevo barbero</CardTitle>
            <form action={createBarberAction} className="space-y-3">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" placeholder="Carlos" required />
              </div>
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  placeholder="Degradados y diseños"
                />
              </div>
              <div>
                <Label htmlFor="bio">Descripción</Label>
                <Textarea id="bio" name="bio" rows={2} />
              </div>
              <div>
                <Label htmlFor="avatar_url">Foto (URL)</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="commission_rate">Comisión (%)</Label>
                <Input
                  id="commission_rate"
                  name="commission_rate"
                  type="number"
                  min={0}
                  max={100}
                  step="1"
                  defaultValue={50}
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
            <CardTitle>Equipo ({barbers.length})</CardTitle>
            {barbers.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay barberos.</p>
            ) : (
              <div className="space-y-4">
                {barbers.map((b) => (
                  <details
                    key={b.id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-sm">
                      <span className="font-medium">
                        {b.name}
                        {!b.active && (
                          <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                            inactivo
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        Comisión {Number(b.commission_rate)}%
                      </span>
                    </summary>

                    <form
                      action={updateBarberAction}
                      className="mt-3 space-y-3 border-t border-gray-100 pt-3"
                    >
                      <input type="hidden" name="id" value={b.id} />
                      <div>
                        <Label htmlFor={`name-${b.id}`}>Nombre</Label>
                        <Input
                          id={`name-${b.id}`}
                          name="name"
                          defaultValue={b.name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`specialty-${b.id}`}>Especialidad</Label>
                        <Input
                          id={`specialty-${b.id}`}
                          name="specialty"
                          defaultValue={b.specialty ?? ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`bio-${b.id}`}>Descripción</Label>
                        <Textarea
                          id={`bio-${b.id}`}
                          name="bio"
                          rows={2}
                          defaultValue={b.bio ?? ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`avatar-${b.id}`}>Foto (URL)</Label>
                        <Input
                          id={`avatar-${b.id}`}
                          name="avatar_url"
                          defaultValue={b.avatar_url ?? ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`comm-${b.id}`}>Comisión (%)</Label>
                        <Input
                          id={`comm-${b.id}`}
                          name="commission_rate"
                          type="number"
                          min={0}
                          max={100}
                          step="1"
                          defaultValue={Number(b.commission_rate)}
                          required
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={b.active}
                          className="h-4 w-4"
                        />
                        Activo (visible en la web)
                      </label>
                      <div className="flex gap-2">
                        <Button type="submit" className="px-3 py-1 text-xs">
                          Guardar cambios
                        </Button>
                      </div>
                    </form>

                    <form action={deleteBarberAction} className="mt-2">
                      <input type="hidden" name="id" value={b.id} />
                      <Button variant="danger" className="px-3 py-1 text-xs">
                        Eliminar barbero
                      </Button>
                    </form>
                  </details>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
