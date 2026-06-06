"use server";

import { getPublicTenant } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";

// Reserva pública desde /b/[slug]/book (cliente final NO autenticado).
// Crea (o reutiliza) un cliente y genera la cita en estado 'scheduled'.
// NOTA: para producción conviene mover esto a un endpoint con service role
// + validación anti-spam (captcha, rate limit). Aquí queda como base.
export async function bookPublicAppointment(slug: string, formData: FormData) {
  const tenant = await getPublicTenant(slug);
  if (!tenant) {
    return { ok: false, message: "Barbería no encontrada" };
  }

  const supabase = createClient();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const serviceId = String(formData.get("service_id") || "") || null;
  const startStr = String(formData.get("start_time"));

  if (!name || !startStr) {
    return { ok: false, message: "Completa nombre y fecha" };
  }

  const start = new Date(startStr);

  // Duración según servicio (default 30 min).
  let durationMin = 30;
  if (serviceId) {
    const { data: svc } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", serviceId)
      .eq("tenant_id", tenant.id)
      .maybeSingle();
    if (svc?.duration_minutes) durationMin = svc.duration_minutes;
  }
  const end = new Date(start.getTime() + durationMin * 60_000);

  // 1) Crear el cliente (visitante anónimo). La política clients_insert_public
  //    permite insertar como anon. En producción protégelo con captcha /
  //    rate limit o muévelo a un endpoint con service role.
  const { data: client } = await supabase
    .from("clients")
    .insert({ tenant_id: tenant.id, name, phone: phone || null })
    .select()
    .maybeSingle();

  // 2) Crear la cita (la política appointments_insert_public permite anon).
  const { error } = await supabase.from("appointments").insert({
    tenant_id: tenant.id,
    client_id: client?.id ?? null,
    service_id: serviceId,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    status: "scheduled",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "¡Reserva creada! Te esperamos." };
}
