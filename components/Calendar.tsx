"use client";

import { useMemo, useState } from "react";

// ============================================================================
//  Calendario visual (sin dependencias) para elegir el día de la cita.
//  Resalta el día seleccionado y deshabilita los días pasados.
// ============================================================================
const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function Calendar({
  selected,
  onSelect,
  accentColor = "#22d3ee",
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  accentColor?: string;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();

  // Día de la semana del primer día (0=Lunes ... 6=Domingo)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const canGoPrev =
    new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setView(new Date(year, month - 1, 1))}
          disabled={!canGoPrev}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-white">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-500">
        {DAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const isPast = d < today;
          const isSelected = selected && toKey(d) === toKey(selected);
          const isToday = toKey(d) === toKey(today);
          return (
            <button
              key={toKey(d)}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(d)}
              className={`grid h-9 place-items-center rounded-lg text-sm transition ${
                isPast
                  ? "cursor-not-allowed text-slate-700"
                  : "text-slate-200 hover:bg-white/10"
              } ${isToday && !isSelected ? "ring-1 ring-white/20" : ""}`}
              style={
                isSelected
                  ? {
                      backgroundColor: accentColor,
                      color: "#05060a",
                      fontWeight: 700,
                    }
                  : undefined
              }
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
