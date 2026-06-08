import "server-only";

// ============================================================================
//  Carga la configuración/diseño de la barbería (fila única de `settings`).
//  Lectura pública (RLS permite SELECT a todos).
// ============================================================================
import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/lib/types";

const FALLBACK: Settings = {
  id: 1,
  name: "Mi Barbería",
  tagline: "Cortes con estilo",
  phone: null,
  address: null,
  instagram: null,
  primary_color: "#111827",
  accent_color: "#f59e0b",
  about: null,
  logo_url: null,
  opening_hours: null,
  open_time: "09:00",
  close_time: "20:00",
  slot_minutes: 30,
  updated_at: new Date().toISOString(),
};

export async function getSettings(): Promise<Settings> {
  const supabase = createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return (data as Settings) ?? FALLBACK;
}
