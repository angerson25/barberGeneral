import "server-only";

// ============================================================================
//  Helpers de multi-tenant (lado servidor).
//  Resuelven el tenant a partir del `slug` de la URL ([tenantSlug]) y
//  verifican que el usuario autenticado tenga membership en ese tenant.
// ============================================================================
import { createClient } from "@/lib/supabase/server";
import type { Membership, Tenant } from "@/lib/types";

export interface TenantAccess {
  tenant: Tenant;
  membership: Membership;
  userId: string;
}

/**
 * Devuelve el tenant por slug + la membership del usuario actual.
 * Retorna null si el tenant no existe o el usuario no tiene acceso.
 *
 * Multi-tenant: el aislamiento real lo garantiza RLS en la base de datos;
 * esta función añade la comprobación a nivel de app para redirigir/UX.
 */
export async function getTenantAccess(
  slug: string
): Promise<TenantAccess | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 1) Resolver tenant por slug.
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!tenant) return null;

  // 2) Verificar membership del usuario en ese tenant.
  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return null;

  return { tenant, membership, userId: user.id };
}

/**
 * Resuelve un tenant por slug SIN requerir autenticación.
 * Útil para la página pública de reservas /b/[tenantSlug]/book.
 */
export async function getPublicTenant(slug: string): Promise<Tenant | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();
  return data ?? null;
}
