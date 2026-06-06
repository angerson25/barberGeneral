"use client";

import { useState } from "react";
import { bookPublicAppointment } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import type { Service } from "@/lib/types";

// Formulario de reserva pública (Client Component) con feedback de resultado.
export function BookingForm({
  slug,
  services,
}: {
  slug: string;
  services: Pick<Service, "id" | "name" | "duration_minutes">[];
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  async function onSubmit(formData: FormData) {
    setPending(true);
    setResult(null);
    const res = await bookPublicAppointment(slug, formData);
    setResult(res);
    setPending(false);
  }

  if (result?.ok) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        {result.message}
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {result && !result.ok && (
        <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">
          {result.message}
        </p>
      )}
      <div>
        <Label htmlFor="name">Tu nombre</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" />
      </div>
      <div>
        <Label htmlFor="service_id">Servicio</Label>
        <Select id="service_id" name="service_id">
          <option value="">— Elige un servicio —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.duration_minutes} min)
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="start_time">Fecha y hora</Label>
        <Input id="start_time" name="start_time" type="datetime-local" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Reservando..." : "Reservar"}
      </Button>
    </form>
  );
}
