"use client";

import { useState } from "react";
import { bookAppointment } from "@/app/actions";
import type { Service } from "@/lib/types";

// Formulario de reserva pública (sin login), estilizado para el tema oscuro.
export function BookingForm({
  services,
  accentColor,
}: {
  services: Pick<Service, "id" | "name" | "duration_minutes" | "price">[];
  accentColor?: string;
}) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  async function onSubmit(formData: FormData) {
    setPending(true);
    setResult(null);
    const res = await bookAppointment(formData);
    setResult(res);
    setPending(false);
  }

  if (result?.ok) {
    return (
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-300">{result.message}</p>
        <button
          onClick={() => setResult(null)}
          className="mt-3 text-sm text-emerald-200/80 underline hover:text-emerald-100"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {result && !result.ok && (
        <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-2.5 text-sm text-red-300">
          {result.message}
        </p>
      )}
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Tu nombre
        </label>
        <input id="name" name="name" required className="input-dark" />
      </div>
      <div>
        <label
          htmlFor="phone"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Opcional"
          className="input-dark"
        />
      </div>
      <div>
        <label
          htmlFor="service_id"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Servicio
        </label>
        <select id="service_id" name="service_id" className="input-dark">
          <option value="">— Elige un servicio —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration_minutes} min · ${Number(s.price).toFixed(2)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="start_time"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Fecha y hora
        </label>
        <input
          id="start_time"
          name="start_time"
          type="datetime-local"
          required
          className="input-dark"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full px-5 py-3 text-sm font-semibold text-ink-900 shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: accentColor ?? "#22d3ee" }}
      >
        {pending ? "Reservando..." : "Reservar turno"}
      </button>
    </form>
  );
}
