"use server";

// ============================================================================
//  Reserva pública (cliente final SIN login) desde la web de la barbería.
//  Crea el cliente + la cita en estado 'scheduled'.
//  NOTA: para producción añade captcha / rate limit / validación de horario.
// ============================================================================
import { createClient } from "@/lib/supabase/server";

export async function bookAppointment(formData: FormData) {
  const supabase = createClient();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const serviceId = String(formData.get("service_id") || "") || null;
  const startStr = String(formData.get("start_time"));

  if (!name || !startStr) {
    return { ok: false, message: "Completa tu nombre y la fecha/hora." };
  }

  const start = new Date(startStr);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, message: "Fecha u hora inválida." };
  }

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

  // 1) Registrar el cliente (inserción pública permitida por RLS).
  const { data: client } = await supabase
    .from("clients")
    .insert({ name, phone: phone || null })
    .select()
    .maybeSingle();

  // 2) Crear la cita.
  const { error } = await supabase.from("appointments").insert({
    client_id: client?.id ?? null,
    service_id: serviceId,
    customer_name: name,
    customer_phone: phone || null,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    status: "scheduled",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "¡Reserva confirmada! Te esperamos." };
}
