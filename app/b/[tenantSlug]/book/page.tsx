import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/tenant";
import { createClient } from "@/lib/supabase/server";
import { BookingForm } from "./BookingForm";
import { Card } from "@/components/ui/Card";
import type { Service } from "@/lib/types";

// Página pública de reservas por barbería: /b/[tenantSlug]/book
// No requiere login. Resuelve el tenant por slug (lectura pública en RLS).
export default async function BookPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const tenant = await getPublicTenant(params.tenantSlug);
  if (!tenant) notFound();

  const supabase = createClient();
  const { data } = await supabase
    .from("services")
    .select("id, name, duration_minutes")
    .eq("tenant_id", tenant.id)
    .order("name");

  const services = (data ?? []) as Pick<
    Service,
    "id" | "name" | "duration_minutes"
  >[];

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{tenant.name}</h1>
        <p className="text-sm text-gray-600">Reserva tu turno online</p>
      </div>

      <Card>
        <BookingForm slug={tenant.slug} services={services} />
      </Card>

      <p className="mt-6 text-center text-xs text-gray-400">
        Powered by Barber<span className="text-brand-accent">SaaS</span>
      </p>
    </div>
  );
}
