import "server-only";

// ============================================================================
//  Helpers de autenticación del administrador (lado servidor).
//  Solo los usuarios presentes en la tabla `admins` pueden entrar al panel.
// ============================================================================
import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el usuario actual si está autenticado Y es administrador.
 * Retorna null en cualquier otro caso.
 */
export async function getAdminUser() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Verifica que el usuario esté en la tabla `admins` (RLS lo limita a su fila).
  const { data: admin } = await supabase
    .from("admins")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) return null;

  return { id: user.id, email: user.email, fullName: admin.full_name };
}
