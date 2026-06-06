"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Actualiza la configuración/diseño de la barbería (fila única, solo admin).
export async function updateSettingsAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase
    .from("settings")
    .update({
      name: String(formData.get("name") ?? "").trim() || "Mi Barbería",
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      instagram: String(formData.get("instagram") ?? "").trim() || null,
      about: String(formData.get("about") ?? "").trim() || null,
      opening_hours: String(formData.get("opening_hours") ?? "").trim() || null,
      primary_color: String(formData.get("primary_color") ?? "").trim() || "#111827",
      accent_color: String(formData.get("accent_color") ?? "").trim() || "#f59e0b",
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
