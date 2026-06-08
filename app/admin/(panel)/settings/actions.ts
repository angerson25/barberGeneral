"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Tipos de imagen permitidos para el logo y tamaño máximo (2 MB).
const ALLOWED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

// Normaliza una hora "HH:MM". Devuelve null si no es válida.
function parseTime(value: string): string | null {
  const v = value.trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) return null;
  return v;
}

// Sube el logo/favicon al bucket "branding" y devuelve su URL pública.
// Devuelve `undefined` si no se envió ningún archivo (para no tocar el valor actual).
async function uploadLogo(
  supabase: ReturnType<typeof createClient>,
  file: File | null
): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;

  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    throw new Error("Formato de logo no válido. Usa PNG, JPG, WEBP o SVG.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("El logo es demasiado grande (máximo 2 MB).");
  }

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  // Nombre con timestamp para evitar problemas de caché del navegador/CDN.
  const path = `logo-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("branding")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`No se pudo subir el logo: ${error.message}`);

  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}

// Actualiza la configuración/diseño de la barbería (fila única, solo admin).
export async function updateSettingsAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();

  // Subida opcional del logo. Si se marcó "quitar logo", se vacía el campo.
  const removeLogo = formData.get("remove_logo") === "on";
  const logoFile = formData.get("logo") as File | null;
  const uploadedUrl = await uploadLogo(supabase, logoFile);

  // Horario de reservas: validar formato y que apertura < cierre.
  const openTime = parseTime(String(formData.get("open_time") ?? "")) ?? "09:00";
  const closeTime = parseTime(String(formData.get("close_time") ?? "")) ?? "20:00";
  if (openTime >= closeTime) {
    throw new Error("La hora de apertura debe ser anterior a la de cierre.");
  }

  // Intervalo de cada turno: entero entre 5 y 240 minutos.
  const slot = Math.round(Number(formData.get("slot_minutes") ?? 30));
  const slotMinutes = Number.isFinite(slot) ? Math.min(Math.max(slot, 5), 240) : 30;

  const update: Record<string, unknown> = {
    name: String(formData.get("name") ?? "").trim() || "Mi Barbería",
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    instagram: String(formData.get("instagram") ?? "").trim() || null,
    about: String(formData.get("about") ?? "").trim() || null,
    opening_hours: String(formData.get("opening_hours") ?? "").trim() || null,
    open_time: openTime,
    close_time: closeTime,
    slot_minutes: slotMinutes,
    primary_color: String(formData.get("primary_color") ?? "").trim() || "#111827",
    accent_color: String(formData.get("accent_color") ?? "").trim() || "#f59e0b",
    updated_at: new Date().toISOString(),
  };

  // Solo modifica logo_url si se subió uno nuevo o se pidió quitarlo.
  if (uploadedUrl) update.logo_url = uploadedUrl;
  else if (removeLogo) update.logo_url = null;

  const { error } = await supabase.from("settings").update(update).eq("id", 1);
  if (error) throw new Error(`No se pudo guardar la configuración: ${error.message}`);

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
