"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Crea una nueva barbería (tenant) y asigna al usuario actual como OWNER.
export async function createTenantAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();

  // Normaliza el slug: minúsculas, guiones, sin caracteres raros.
  const slug = (slugRaw || name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!name || !slug) {
    redirect("/select-tenant?error=Datos+invalidos");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1) Crear el tenant.
  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .insert({ name, slug })
    .select()
    .single();

  if (tErr || !tenant) {
    redirect(`/select-tenant?error=${encodeURIComponent(tErr?.message ?? "No se pudo crear")}`);
  }

  // 2) Crear la membership como OWNER (la política RLS lo permite porque
  //    user_id = auth.uid()).
  const { error: mErr } = await supabase.from("memberships").insert({
    user_id: user.id,
    tenant_id: tenant.id,
    role: "owner",
  });

  if (mErr) {
    redirect(`/select-tenant?error=${encodeURIComponent(mErr.message)}`);
  }

  redirect(`/${tenant.slug}/dashboard`);
}
