// ============================================================================
//  Lectura y normalización de las variables de entorno de Supabase.
//  Limpia espacios y barras finales para evitar URLs mal formadas
//  (causa típica del error "Invalid path specified in request URL"
//  cuando la URL termina en "/").
// ============================================================================
export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Quita espacios accidentales y barras finales.
  const url = rawUrl.trim().replace(/\/+$/, "");
  const anonKey = rawKey.trim();

  return { url, anonKey };
}
