"use server";

import { revalidatePath } from "next/cache";
import { getTenantAccess } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";

// CRUD de citas (agenda interna). Cualquier miembro del tenant puede gestionar.

export async function createAppointmentAction(slug: string, formData: FormData) {
  const access = await getTenantAccess(slug);
  if (!access) throw new Error("Sin acceso al tenant");

  const supabase = createClient();

  const serviceId = String(formData.get("service_id") || "") || null;
  const startStr = String(formData.get("start_time"));
  const start = new Date(startStr);

  // Calcula end_time a partir de la duración del servicio (si hay).
  let durationMin = 30;
  if (serviceId) {
    const { data: svc } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .eq("tenant_id", access.tenant.id)
      .maybeSingle();
    if (svc?.duration_minutes) durationMin = svc.duration_minutes;
  }
  const end = new Date(start.getTime() + durationMin * 60_000);

  await supabase.from("appointments").insert({
    tenant_id: access.tenant.id,
    client_id: String(formData.get("client_id") || "") || null,
    service_id: serviceId,
    barber_id: access.userId, // por defecto el usuario actual
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    status: "scheduled",
  });

  revalidatePath(`/${slug}/appointments`);
}

export async function updateAppointmentStatusAction(
  slug: string,
  formData: FormData
) {
  const access = await getTenantAccess(slug);
  if (!access) throw new Error("Sin acceso al tenant");

  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  const supabase = createClient();
  await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("tenant_id", access.tenant.id);

  revalidatePath(`/${slug}/appointments`);
}
