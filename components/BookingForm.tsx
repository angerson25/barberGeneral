"use client";

import { useMemo, useState } from "react";
import { bookAppointment } from "@/app/actions";
import { Calendar } from "@/components/Calendar";
import type { Barber, Service } from "@/lib/types";

type ServiceLite = Pick<
  Service,
  "id" | "name" | "duration_minutes" | "price"
>;
type BarberLite = Pick<Barber, "id" | "name" | "specialty">;

// Convierte "HH:MM" a minutos desde medianoche.
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Genera franjas horarias entre apertura y cierre según el intervalo.
function buildSlots(open: string, close: string, step: number): string[] {
  const start = toMinutes(open);
  const end = toMinutes(close);
  const inc = step > 0 ? step : 30;
  const slots: string[] = [];
  for (let t = start; t < end; t += inc) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return slots;
}

// Formulario de reserva pública (sin login): barbero + servicio + calendario.
export function BookingForm({
  services,
  barbers = [],
  accentColor,
  openTime = "09:00",
  closeTime = "20:00",
  slotMinutes = 30,
}: {
  services: ServiceLite[];
  barbers?: BarberLite[];
  accentColor?: string;
  openTime?: string;
  closeTime?: string;
  slotMinutes?: number;
}) {
  const accent = accentColor ?? "#22d3ee";
  const slots = useMemo(
    () => buildSlots(openTime, closeTime, slotMinutes),
    [openTime, closeTime, slotMinutes]
  );

  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");

  // Combina fecha + hora en un valor datetime-local (YYYY-MM-DDTHH:mm).
  const startTime = useMemo(() => {
    if (!date || !time) return "";
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
    return `${key}T${time}`;
  }, [date, time]);

  async function onSubmit(formData: FormData) {
    if (!startTime) {
      setResult({ ok: false, message: "Elige un día y una hora." });
      return;
    }
    formData.set("start_time", startTime);
    setPending(true);
    setResult(null);
    const res = await bookAppointment(formData);
    setResult(res);
    setPending(false);
    if (res.ok) {
      setName("");
      setPhone("");
      setServiceId("");
      setBarberId("");
      setDate(null);
      setTime("");
    }
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
    <form action={onSubmit} className="space-y-5">
      {result && !result.ok && (
        <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-2.5 text-sm text-red-300">
          {result.message}
        </p>
      )}

      {/* Datos personales */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Tu nombre
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-dark"
          />
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-dark"
          />
        </div>
      </div>

      {/* Barbero */}
      {barbers.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Elige tu barbero
          </span>
          <input type="hidden" name="barber_id" value={barberId} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setBarberId("")}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                barberId === ""
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <span className="font-semibold">Cualquiera</span>
              <span className="block text-xs text-slate-500">Sin preferencia</span>
            </button>
            {barbers.map((b) => {
              const active = barberId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBarberId(b.id)}
                  className="rounded-xl border p-3 text-left text-sm transition"
                  style={
                    active
                      ? { borderColor: accent, backgroundColor: `${accent}22`, color: "#fff" }
                      : undefined
                  }
                >
                  <span
                    className={`font-semibold ${active ? "" : "text-slate-200"}`}
                  >
                    {b.name}
                  </span>
                  {b.specialty && (
                    <span className="block text-xs text-slate-500">
                      {b.specialty}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Servicio */}
      <div>
        <label
          htmlFor="service_id"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          Servicio
        </label>
        <select
          id="service_id"
          name="service_id"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="input-dark"
        >
          <option value="">— Elige un servicio —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration_minutes} min · ${Number(s.price).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {/* Calendario + horas */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <span className="mb-3 block text-sm font-medium text-slate-300">
            Elige el día
          </span>
          <Calendar selected={date} onSelect={setDate} accentColor={accent} />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <span className="mb-3 block text-sm font-medium text-slate-300">
            {date
              ? `Horarios ${date.toLocaleDateString("es", {
                  day: "2-digit",
                  month: "long",
                })}`
              : "Elige primero un día"}
          </span>
          {date ? (
            <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1">
              {slots.map((s) => {
                const active = time === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTime(s)}
                    className="rounded-lg border border-white/10 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    style={
                      active
                        ? { backgroundColor: accent, color: "#05060a", fontWeight: 700 }
                        : undefined
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Selecciona una fecha en el calendario.
            </p>
          )}
        </div>
      </div>

      {startTime && (
        <p className="text-center text-sm text-slate-400">
          Reservas para el{" "}
          <span className="font-semibold text-white">
            {new Date(startTime).toLocaleString("es", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full px-5 py-3 text-sm font-semibold text-ink-900 shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: accent }}
      >
        {pending ? "Reservando..." : "Confirmar reserva"}
      </button>
    </form>
  );
}
