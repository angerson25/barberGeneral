"use client";

// ============================================================================
//  Cliente de Supabase para el NAVEGADOR (Client Components).
//  Usa createBrowserClient de @supabase/ssr para que la sesión se comparta
//  con el servidor a través de cookies.
// ============================================================================
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
