"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Gestión de citas desde el panel (solo admin).

export async function createAppointmentAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();

  const serviceId = String(formData.get("service_id") || "") || null;
  const clientId = String(formData.get("client_id") || "") || null;
  const barberId = String(formData.get("barber_id") || "") || null;
  const start = new Date(String(formData.get("start_time")));

  // Duración según el servicio (default 30 min).
  let durationMin = 30;
  if (serviceId) {
    const { data: svc } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .maybeSingle();
    if (svc?.duration_minutes) durationMin = svc.duration_minutes;
  }
  const end = new Date(start.getTime() + durationMin * 60_000);

  // Nombre snapshot a partir del cliente elegido (si hay).
  let customerName: string | null = null;
  if (clientId) {
    const { data: cli } = await supabase
      .from("clients")
      .select("name, phone")
      .eq("id", clientId)
      .maybeSingle();
    customerName = cli?.name ?? null;
  }

  await supabase.from("appointments").insert({
    client_id: clientId,
    service_id: serviceId,
    barber_id: barberId,
    customer_name: customerName,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    status: "scheduled",
  });

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase
    .from("appointments")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("id")));

  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
}
