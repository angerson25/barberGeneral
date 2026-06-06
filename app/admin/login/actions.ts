"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Login del administrador (no hay registro público).
export async function loginAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/admin/login?error=${encodeURIComponent("Credenciales inválidas")}`);
  }

  // Verifica que el usuario sea administrador (esté en la tabla `admins`).
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect(`/admin/login?error=${encodeURIComponent("No tienes acceso al panel")}`);
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
