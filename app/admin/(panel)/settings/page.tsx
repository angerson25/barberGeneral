import { getSettings } from "@/lib/settings";
import { updateSettingsAction } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";

// Configuración y personalización de la web pública.
export default async function SettingsPage() {
  const s = await getSettings();
  const initial = (s.name?.trim()?.[0] ?? "B").toUpperCase();

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza la información, el horario y la apariencia de tu web pública.
        </p>
      </header>

      {/* Un único formulario que agrupa todas las secciones y guarda de una vez. */}
      <form action={updateSettingsAction} className="space-y-6">
        {/* ── Marca / Identidad ─────────────────────────────────────────── */}
        <Card>
          <CardTitle>Marca</CardTitle>
          <p className="mb-4 text-xs text-gray-500">
            El logo se usa en la cabecera de la web y como icono de la pestaña
            del navegador (favicon).
          </p>

          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {s.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.logo_url}
                  alt="Logo actual"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-gray-400">{initial}</span>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="logo">Logo / favicon</Label>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, WEBP o SVG. Cuadrado recomendado (mín. 256×256 px).
              </p>
              {s.logo_url && (
                <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" name="remove_logo" className="rounded" />
                  Quitar el logo actual
                </label>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={s.name} required />
              <p className="mt-1 text-xs text-gray-500">
                Aparece junto al logo en la cabecera.
              </p>
            </div>
            <div>
              <Label htmlFor="tagline">Eslogan</Label>
              <Input id="tagline" name="tagline" defaultValue={s.tagline ?? ""} />
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="about">Sobre la barbería</Label>
            <Textarea id="about" name="about" rows={3} defaultValue={s.about ?? ""} />
          </div>
        </Card>

        {/* ── Contacto ──────────────────────────────────────────────────── */}
        <Card>
          <CardTitle>Contacto</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={s.phone ?? ""} />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" defaultValue={s.address ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="instagram">Instagram (URL)</Label>
              <Input
                id="instagram"
                name="instagram"
                placeholder="https://instagram.com/tu_barberia"
                defaultValue={s.instagram ?? ""}
              />
            </div>
          </div>
        </Card>

        {/* ── Horarios ──────────────────────────────────────────────────── */}
        <Card>
          <CardTitle>Horarios</CardTitle>

          <div className="mb-5">
            <Label htmlFor="opening_hours">Horario visible al público</Label>
            <Input
              id="opening_hours"
              name="opening_hours"
              placeholder="Lun–Sáb 9:00–20:00"
              defaultValue={s.opening_hours ?? ""}
            />
            <p className="mt-1 text-xs text-gray-500">
              Texto informativo que se muestra en la web (no afecta a las reservas).
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
            <p className="text-sm font-semibold text-gray-900">Reservas online</p>
            <p className="mb-3 text-xs text-gray-500">
              Define las horas disponibles y la duración de cada turno en el
              calendario de reserva.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="open_time">Apertura</Label>
                <Input
                  id="open_time"
                  name="open_time"
                  type="time"
                  defaultValue={s.open_time ?? "09:00"}
                />
              </div>
              <div>
                <Label htmlFor="close_time">Cierre</Label>
                <Input
                  id="close_time"
                  name="close_time"
                  type="time"
                  defaultValue={s.close_time ?? "20:00"}
                />
              </div>
              <div>
                <Label htmlFor="slot_minutes">Intervalo (min)</Label>
                <Input
                  id="slot_minutes"
                  name="slot_minutes"
                  type="number"
                  min={5}
                  step={5}
                  defaultValue={s.slot_minutes ?? 30}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ── Apariencia ────────────────────────────────────────────────── */}
        <Card>
          <CardTitle>Apariencia</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="primary_color">Color principal</Label>
              <Input
                id="primary_color"
                name="primary_color"
                type="color"
                defaultValue={s.primary_color ?? "#111827"}
                className="h-10 p-1"
              />
            </div>
            <div>
              <Label htmlFor="accent_color">Color de acento</Label>
              <Input
                id="accent_color"
                name="accent_color"
                type="color"
                defaultValue={s.accent_color ?? "#f59e0b"}
                className="h-10 p-1"
              />
            </div>
          </div>
        </Card>

        <div className="sticky bottom-0 -mx-1 flex justify-end border-t border-gray-200 bg-gray-50/80 px-1 py-3 backdrop-blur">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>
    </div>
  );
}
