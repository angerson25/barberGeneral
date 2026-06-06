import { createClient } from "@/lib/supabase/server";
import {
  createAppointmentAction,
  updateAppointmentStatusAction,
} from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Card, CardTitle } from "@/components/ui/Card";
import type { Appointment, Barber, Client, Service } from "@/lib/types";

type ApptJoined = Appointment & {
  service: Pick<Service, "name"> | null;
  barber: Pick<Barber, "name"> | null;
};

// Vista de agenda: lista simple + alta manual + cambio de estado.
export default async function AppointmentsPage() {
  const supabase = createClient();

  const [
    { data: apptData },
    { data: clientData },
    { data: serviceData },
    { data: barberData },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, service:services(name), barber:barbers(name)")
      .order("start_time", { ascending: true }),
    supabase.from("clients").select("*").order("name"),
    supabase.from("services").select("*").order("name"),
    supabase.from("barbers").select("*").order("name"),
  ]);

  const appointments = (apptData ?? []) as ApptJoined[];
  const clients = (clientData ?? []) as Client[];
  const services = (serviceData ?? []) as Service[];
  const barbers = (barberData ?? []) as Barber[];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Agenda</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardTitle>Nueva cita</CardTitle>
            <form action={createAppointmentAction} className="space-y-3">
              <div>
                <Label htmlFor="client_id">Cliente</Label>
                <Select id="client_id" name="client_id">
                  <option value="">— Sin cliente —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="service_id">Servicio</Label>
                <Select id="service_id" name="service_id">
                  <option value="">— Sin servicio —</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.duration_minutes} min)
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="barber_id">Barbero</Label>
                <Select id="barber_id" name="barber_id">
                  <option value="">— Sin asignar —</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="start_time">Fecha y hora</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="datetime-local"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Crear cita
              </Button>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardTitle>Citas ({appointments.length})</CardTitle>
            {appointments.length === 0 ? (
              <p className="text-sm text-gray-500">No hay citas registradas.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {appointments.map((a) => (
                  <li key={a.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {a.customer_name ?? "Cliente"} ·{" "}
                          <span className="text-gray-600">
                            {a.service?.name ?? "Servicio"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.start_time).toLocaleString("es", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                          {a.barber?.name ? ` · ✂ ${a.barber.name}` : ""}
                          {a.customer_phone ? ` · ${a.customer_phone}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>

                    <form
                      action={updateAppointmentStatusAction}
                      className="mt-2 flex gap-2"
                    >
                      <input type="hidden" name="id" value={a.id} />
                      <Select
                        name="status"
                        defaultValue={a.status}
                        className="max-w-[180px]"
                      >
                        <option value="scheduled">Reservada</option>
                        <option value="completed">Completada</option>
                        <option value="no_show">No-show</option>
                        <option value="cancelled">Cancelada</option>
                      </Select>
                      <Button variant="secondary" className="px-3 py-1 text-xs">
                        Actualizar
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const map: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    no_show: "bg-amber-100 text-amber-700",
    cancelled: "bg-gray-200 text-gray-600",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}
