import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Fila de cita completada usada para calcular comisiones por barbero.
type ApptForCommission = {
  service: { price: number | null } | null;
  barber: { name: string; commission_rate: number } | null;
};

type Row = {
  name: string;
  rate: number;
  count: number;
  revenue: number;
  barberShare: number;
  shopShare: number;
};

// Devuelve el primer y último instante del mes "YYYY-MM" (o el mes actual).
function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

// Página dedicada: ¿cuánto cobra cada barbero por sus comisiones?
export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
  const month = searchParams.month ?? defaultMonth;
  const { start, end } = monthRange(month);

  const supabase = createClient();
  const { data } = await supabase
    .from("appointments")
    .select("service:services(price), barber:barbers(name, commission_rate)")
    .eq("status", "completed")
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString());

  const completed = (data ?? []) as unknown as ApptForCommission[];

  // Agrupa por barbero: nº servicios, facturación, comisión y parte de la barbería.
  const map = new Map<string, Row>();
  for (const a of completed) {
    if (!a.barber) continue;
    const price = Number(a.service?.price ?? 0);
    const rate = Number(a.barber.commission_rate ?? 0);
    const key = a.barber.name;
    const cur =
      map.get(key) ??
      { name: key, rate, count: 0, revenue: 0, barberShare: 0, shopShare: 0 };
    cur.count += 1;
    cur.revenue += price;
    cur.barberShare += (price * rate) / 100;
    cur.shopShare += (price * (100 - rate)) / 100;
    map.set(key, cur);
  }
  const rows = Array.from(map.values()).sort(
    (a, b) => b.barberShare - a.barberShare
  );

  const totals = rows.reduce(
    (acc, r) => ({
      count: acc.count + r.count,
      revenue: acc.revenue + r.revenue,
      barberShare: acc.barberShare + r.barberShare,
      shopShare: acc.shopShare + r.shopShare,
    }),
    { count: 0, revenue: 0, barberShare: 0, shopShare: 0 }
  );

  const monthLabel = start.toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Comisiones</h1>
      <p className="mb-6 text-sm text-gray-500">
        Cálculo a partir de las citas <strong>completadas</strong>. Cada barbero
        cobra según su porcentaje de comisión.
      </p>

      {/* Filtro por mes */}
      <Card className="mb-6">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="month"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Mes
            </label>
            <input
              id="month"
              name="month"
              type="month"
              defaultValue={month}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <Button type="submit">Ver</Button>
        </form>
      </Card>

      {/* Totales */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Facturado" value={formatMoney(totals.revenue)} />
        <Kpi label="A pagar a barberos" value={formatMoney(totals.barberShare)} />
        <Kpi label="Queda para la barbería" value={formatMoney(totals.shopShare)} />
      </div>

      <Card>
        <h2 className="mb-3 text-base font-semibold capitalize">
          Detalle · {monthLabel}
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay citas completadas con barbero asignado en este mes.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                  <th className="py-2 font-medium">Barbero</th>
                  <th className="py-2 text-right font-medium">Servicios</th>
                  <th className="py-2 text-right font-medium">Facturado</th>
                  <th className="py-2 text-right font-medium">Comisión %</th>
                  <th className="py-2 text-right font-medium">A pagar</th>
                  <th className="py-2 text-right font-medium">Barbería</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => (
                  <tr key={r.name}>
                    <td className="py-2 font-medium">{r.name}</td>
                    <td className="py-2 text-right">{r.count}</td>
                    <td className="py-2 text-right">{formatMoney(r.revenue)}</td>
                    <td className="py-2 text-right">{r.rate}%</td>
                    <td className="py-2 text-right font-semibold text-brand">
                      {formatMoney(r.barberShare)}
                    </td>
                    <td className="py-2 text-right text-gray-600">
                      {formatMoney(r.shopShare)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td className="py-2">Total</td>
                  <td className="py-2 text-right">{totals.count}</td>
                  <td className="py-2 text-right">
                    {formatMoney(totals.revenue)}
                  </td>
                  <td className="py-2 text-right">—</td>
                  <td className="py-2 text-right text-brand">
                    {formatMoney(totals.barberShare)}
                  </td>
                  <td className="py-2 text-right text-gray-600">
                    {formatMoney(totals.shopShare)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  );
}
