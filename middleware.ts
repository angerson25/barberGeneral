import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Refresca la sesión de Supabase en cada request relevante.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Aplica a todo excepto estáticos e imágenes.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
