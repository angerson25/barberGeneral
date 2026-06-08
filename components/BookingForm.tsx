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

// Encabezado de paso con número en degradado neón.
function StepHeader({
  step,
  title,
  hint,
  done,
  accent,
}: {
  step: number;
  title: string;
  hint?: string;
  done?: boolean;
  accent: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black transition"
        style={
          done
            ? { backgroundColor: accent, color: "#05060a" }
            : {
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#e5e7eb",
                border: "1px solid rgba(255,255,255,0.12)",
              }
        }
      >
        {done ? "✓" : step}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

// Formulario de reserva pública (sin login): servicio + barbero + calendario.
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

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );
  const selectedBarber = useMemo(
    () => barbers.find((b) => b.id === barberId) ?? null,
    [barbers, barberId]
  );

  // Combina fecha + hora en un valor datetime-local (YYYY-MM-DDTHH:mm).
  const startTime = useMemo(() => {
    if (!date || !time) return "";
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
    return `${key}T${time}`;
  }, [date, time]);

  const canSubmit = Boolean(name.trim() && serviceId && startTime) && !pending;

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
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-emerald-400/15 text-3xl text-emerald-300">
          ✓
        </div>
        <p className="text-lg font-semibold text-emerald-200">
          {result.message}
        </p>
        <p className="mt-1 text-sm text-emerald-200/60">
          Te esperamos. Recibirás la confirmación pronto.
        </p>
        <button
          onClick={() => setResult(null)}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/20"
        >
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-7">
      {result && !result.ok && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
        >
          <span aria-hidden="true">⚠️</span>
          {result.message}
        </p>
      )}

      {/* Paso 1 · Servicio */}
      <section>
        <StepHeader
          step={1}
          title="Elige tu servicio"
          hint="Selecciona lo que quieres hacerte."
          done={Boolean(serviceId)}
          accent={accent}
        />
        <input type="hidden" name="service_id" value={serviceId} />
        {services.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">
            Aún no hay servicios disponibles.
          </p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {services.map((s) => {
              const active = serviceId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setServiceId(active ? "" : s.id)}
                  className="group flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition hover:-translate-y-0.5"
                  style={
                    active
                      ? { borderColor: accent, backgroundColor: `${accent}1f` }
                      : {
                          borderColor: "rgba(255,255,255,0.1)",
                          backgroundColor: "rgba(255,255,255,0.03)",
                        }
                  }
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">
                      {s.name}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      {s.duration_minutes} min
                    </span>
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-sm font-bold"
                    style={
                      active
                        ? { backgroundColor: accent, color: "#05060a" }
                        : {
                            backgroundColor: "rgba(255,255,255,0.06)",
                            color: "#e5e7eb",
                          }
                    }
                  >
                    ${Number(s.price).toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Paso 2 · Barbero */}
      {barbers.length > 0 && (
        <section>
          <StepHeader
            step={2}
            title="Elige tu barbero"
            hint="Opcional — puedes dejarlo en «Cualquiera»."
            done={Boolean(barberId)}
            accent={accent}
          />
          <input type="hidden" name="barber_id" value={barberId} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button
              type="button"
              aria-pressed={barberId === ""}
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
                  aria-pressed={active}
                  onClick={() => setBarberId(active ? "" : b.id)}
                  className="rounded-xl border p-3 text-left text-sm transition hover:-translate-y-0.5"
                  style={
                    active
                      ? { borderColor: accent, backgroundColor: `${accent}22`, color: "#fff" }
                      : {
                          borderColor: "rgba(255,255,255,0.1)",
                          backgroundColor: "rgba(255,255,255,0.05)",
                        }
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
        </section>
      )}

      {/* Paso 3 · Día y hora */}
      <section>
        <StepHeader
          step={barbers.length > 0 ? 3 : 2}
          title="Elige día y hora"
          hint="Primero el día, luego la franja."
          done={Boolean(startTime)}
          accent={accent}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Calendar selected={date} onSelect={setDate} accentColor={accent} />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className="mb-3 block text-sm font-medium text-slate-300">
              {date
                ? `Horarios · ${date.toLocaleDateString("es", {
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
                      aria-pressed={active}
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
              <div className="grid h-full min-h-[8rem] place-items-center text-center">
                <p className="text-sm text-slate-600">
                  Selecciona una fecha en el calendario.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Paso 4 · Tus datos */}
      <section>
        <StepHeader
          step={barbers.length > 0 ? 4 : 3}
          title="Tus datos"
          hint="Para confirmar tu turno."
          done={Boolean(name.trim())}
          accent={accent}
        />
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
              autoComplete="name"
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
              autoComplete="tel"
              placeholder="Opcional"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-dark"
            />
          </div>
        </div>
      </section>

      {/* Resumen de la reserva */}
      <div className="gradient-border rounded-2xl bg-ink-800/60 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Resumen
        </p>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Servicio</dt>
            <dd className="text-right font-medium text-slate-200">
              {selectedService ? (
                <>
                  {selectedService.name}{" "}
                  <span className="text-slate-500">
                    · ${Number(selectedService.price).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-slate-600">Sin elegir</span>
              )}
            </dd>
          </div>
          {barbers.length > 0 && (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Barbero</dt>
              <dd className="text-right font-medium text-slate-200">
                {selectedBarber ? selectedBarber.name : "Cualquiera"}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Fecha y hora</dt>
            <dd className="text-right font-medium text-slate-200">
              {startTime ? (
                new Date(startTime).toLocaleString("es", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              ) : (
                <span className="text-slate-600">Sin elegir</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full px-5 py-3.5 text-sm font-semibold text-ink-900 shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        style={{ backgroundColor: accent }}
      >
        {pending ? "Reservando..." : "Confirmar reserva"}
      </button>
      {!canSubmit && !pending && (
        <p className="text-center text-xs text-slate-600">
          Completa tu nombre, el servicio y el día y la hora para continuar.
        </p>
      )}
    </form>
  );
}
