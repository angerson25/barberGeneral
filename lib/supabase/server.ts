import "server-only";

// ============================================================================
//  Cliente de Supabase para el SERVIDOR (Server Components, Server Actions,
//  Route Handlers). Lee/escribe la sesión desde las cookies de la request
//  usando createServerClient de @supabase/ssr.
// ============================================================================
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // El método `setAll` falla cuando se llama desde un Server Component.
            // Es seguro ignorarlo si el middleware refresca la sesión.
          }
        },
      },
    }
  );
}
