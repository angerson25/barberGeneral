import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import type { Appointment, Service } from "@/lib/types";

type ApptJoined = Appointment & { service: Pick<Service, "name"> | null };

// Inicio del panel: KPIs + citas de hoy + próximos turnos.
export default async function AdminHomePage() {
  const supabase = createClient();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: todayData } = await supabase
    .from("appointments")
    .select("*, service:services(name)")
    .gte("start_time", startOfDay.toISOString())
    .lte("start_time", endOfDay.toISOString())
    .order("start_time", { ascending: true });

  const { data: upcomingData } = await supabase
    .from("appointments")
    .select("*, service:services(name)")
    .gt("start_time", now.toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  const { count: servicesCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });

  const today = (todayData ?? []) as ApptJoined[];
  const upcoming = (upcomingData ?? []) as ApptJoined[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Inicio</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Kpi label="Citas hoy" value={today.length} />
        <Kpi label="Clientes" value={clientsCount ?? 0} />
        <Kpi label="Servicios" value={servicesCount ?? 0} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-semibold">Citas de hoy</h2>
          <ApptList items={today} emptyText="No hay citas para hoy." />
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-semibold">Próximos turnos</h2>
          <ApptList items={upcoming} emptyText="Sin próximos turnos." />
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Card>
  );
}

function ApptList({
  items,
  emptyText,
}: {
  items: ApptJoined[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((a) => (
        <li key={a.id} className="flex items-center justify-between py-2 text-sm">
          <div>
            <p className="font-medium">{a.customer_name ?? "Cliente"}</p>
            <p className="text-xs text-gray-500">{a.service?.name ?? "Servicio"}</p>
          </div>
          <div className="text-right">
            <p>
              {new Date(a.start_time).toLocaleString("es", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
              })}
            </p>
            <p className="text-xs text-gray-400">{a.status}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
