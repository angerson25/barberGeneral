"use client";

// ============================================================================
//  Cliente de Supabase para el NAVEGADOR (Client Components).
//  Usa createBrowserClient de @supabase/ssr para que la sesión se comparta
//  con el servidor a través de cookies.
// ============================================================================
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
