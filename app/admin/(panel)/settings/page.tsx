import { getSettings } from "@/lib/settings";
import { updateSettingsAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";

// Configuración y personalización de la web pública.
export default async function SettingsPage() {
  const s = await getSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Configuración</h1>

      <Card className="max-w-2xl">
        <CardTitle>Datos de la barbería</CardTitle>
        <form action={updateSettingsAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={s.name} required />
          </div>
          <div>
            <Label htmlFor="tagline">Eslogan</Label>
            <Input id="tagline" name="tagline" defaultValue={s.tagline ?? ""} />
          </div>
          <div>
            <Label htmlFor="about">Sobre la barbería</Label>
            <Textarea id="about" name="about" rows={3} defaultValue={s.about ?? ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={s.phone ?? ""} />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" defaultValue={s.address ?? ""} />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram (URL)</Label>
              <Input id="instagram" name="instagram" defaultValue={s.instagram ?? ""} />
            </div>
            <div>
              <Label htmlFor="opening_hours">Horario</Label>
              <Input
                id="opening_hours"
                name="opening_hours"
                placeholder="Lun–Sáb 9:00–20:00"
                defaultValue={s.opening_hours ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="primary_color">Color principal</Label>
              <Input
                id="primary_color"
                name="primary_color"
                type="color"
                defaultValue={s.primary_color ?? "#111827"}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="accent_color">Color de acento</Label>
              <Input
                id="accent_color"
                name="accent_color"
                type="color"
                defaultValue={s.accent_color ?? "#f59e0b"}
                className="h-10"
              />
            </div>
          </div>

          <Button type="submit">Guardar cambios</Button>
        </form>
      </Card>
    </div>
  );
}
