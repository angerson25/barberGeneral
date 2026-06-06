import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

// ============================================================================
//  Refresca la sesión de Supabase en cada request (Next.js middleware).
//  Mantiene las cookies de auth sincronizadas entre cliente y servidor.
// ============================================================================
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, anonKey } = getSupabaseEnv();

  // Si faltan las variables de entorno (p. ej. mal configuradas en Vercel),
  // no rompas el middleware: deja pasar la request sin refrescar sesión.
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANTE: no ejecutar lógica entre createServerClient y getUser().
    // Esto refresca el token si es necesario.
    await supabase.auth.getUser();
  } catch {
    // Cualquier fallo de red/sesión no debe provocar un 500 del middleware.
    return supabaseResponse;
  }

  return supabaseResponse;
}
