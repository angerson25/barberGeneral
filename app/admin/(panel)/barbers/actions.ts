"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// CRUD de barberos (solo admin; RLS lo refuerza en la base de datos).

export async function createBarberAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase.from("barbers").insert({
    name: String(formData.get("name") ?? "").trim(),
    specialty: String(formData.get("specialty") ?? "").trim() || null,
    bio: String(formData.get("bio") ?? "").trim() || null,
    avatar_url: String(formData.get("avatar_url") ?? "").trim() || null,
    commission_rate: Number(formData.get("commission_rate") ?? 50),
  });

  revalidatePath("/admin/barbers");
  revalidatePath("/");
}

export async function updateBarberAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase
    .from("barbers")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      specialty: String(formData.get("specialty") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      avatar_url: String(formData.get("avatar_url") ?? "").trim() || null,
      commission_rate: Number(formData.get("commission_rate") ?? 50),
      active: formData.get("active") === "on",
    })
    .eq("id", String(formData.get("id")));

  revalidatePath("/admin/barbers");
  revalidatePath("/");
}

export async function deleteBarberAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase.from("barbers").delete().eq("id", String(formData.get("id")));

  revalidatePath("/admin/barbers");
  revalidatePath("/");
}
