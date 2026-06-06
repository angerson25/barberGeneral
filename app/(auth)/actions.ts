"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server Actions de autenticación (Supabase Auth).

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/select-tenant");
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // El trigger handle_new_user crea el profile usando full_name.
      data: { full_name: fullName },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }
  // Según la config de Supabase puede requerir confirmar email.
  redirect("/login?registered=1");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
