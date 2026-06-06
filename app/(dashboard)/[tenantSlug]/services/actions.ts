"use server";

import { revalidatePath } from "next/cache";
import { getTenantAccess } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";

// CRUD de servicios. Solo el rol OWNER puede crear/editar/borrar
// (lo refuerza RLS; aquí también lo validamos a nivel de app).

function assertOwner(role: string) {
  if (role !== "owner") {
    throw new Error("Solo el dueño puede gestionar servicios");
  }
}

export async function createServiceAction(slug: string, formData: FormData) {
  const access = await getTenantAccess(slug);
  if (!access) throw new Error("Sin acceso al tenant");
  assertOwner(access.membership.role);

  const supabase = createClient();
  await supabase.from("services").insert({
    tenant_id: access.tenant.id,
    name: String(formData.get("name") ?? "").trim(),
    duration_minutes: Number(formData.get("duration_minutes") ?? 30),
    price: Number(formData.get("price") ?? 0),
  });

  revalidatePath(`/${slug}/services`);
}

export async function deleteServiceAction(slug: string, formData: FormData) {
  const access = await getTenantAccess(slug);
  if (!access) throw new Error("Sin acceso al tenant");
  assertOwner(access.membership.role);

  const id = String(formData.get("id"));
  const supabase = createClient();
  await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("tenant_id", access.tenant.id);

  revalidatePath(`/${slug}/services`);
}
