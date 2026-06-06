// ============================================================================
//  Tipos de la base de datos (espejo simplificado del esquema de Supabase).
//  En un proyecto real puedes autogenerarlos con:
//    npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
// ============================================================================

export type Role = "owner" | "barber";

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "no_show"
  | "cancelled";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  tenant_id: string;
  role: Role;
  created_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  client_id: string | null;
  service_id: string | null;
  barber_id: string | null;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  created_at: string;
}
