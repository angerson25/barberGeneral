"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// CRUD de clientes (solo admin).

export async function createClientAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase.from("clients").insert({
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath("/admin/clients");
}

export async function deleteClientAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("No autorizado");

  const supabase = createClient();
  await supabase.from("clients").delete().eq("id", String(formData.get("id")));

  revalidatePath("/admin/clients");
}
