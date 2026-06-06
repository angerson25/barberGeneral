"use server";

import { revalidatePath } from "next/cache";
import { getTenantAccess } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";

// Server Actions para CRUD de clientes. Cada acción re-verifica el acceso al
// tenant por slug (defensa en profundidad además de RLS).

export async function createClientAction(slug: string, formData: FormData) {
  const access = await getTenantAccess(slug);
  if (!access) throw new Error("Sin acceso al tenant");

  const supabase = createClient();
  await supabase.from("clients").insert({
    tenant_id: access.tenant.id, // tenant_id derivado del slug verificado
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  revalidatePath(`/${slug}/clients`);
}

export async function updateClientAction(slug: string, formData: FormData) {
  const access = await getTenantAccess(slug);
  if (!access) throw new Error("Sin acceso al tenant");

  const id = String(formData.get("id"));
  const supabase = createClient();
  await supabase
    .from("clients")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id)
    .eq("tenant_id", access.tenant.id);

  revalidatePath(`/${slug}/clients`);
}

export async function deleteClientAction(slug: string, formData: FormData) {
  const access = await getTenantAccess(slug);
  if (!access) throw new Error("Sin acceso al tenant");

  const id = String(formData.get("id"));
  const supabase = createClient();
  await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("tenant_id", access.tenant.id);

  revalidatePath(`/${slug}/clients`);
}
