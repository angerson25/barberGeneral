"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// CRUD de servicios (solo admin; RLS lo refuerza en la base de datos).

export async function createServiceAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  const { error } = await supabase.from("services").insert({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    duration_minutes: Number(formData.get("duration_minutes") ?? 30),
    price: Number(formData.get("price") ?? 0),
  });

  if (error) {
    // Surface el motivo real (p. ej. violación de RLS) en lugar de fallar mudo.
    throw new Error(`No se pudo crear el servicio: ${error.message}`);
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function deleteServiceAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase.from("services").delete().eq("id", String(formData.get("id")));

  revalidatePath("/admin/services");
  revalidatePath("/");
}
