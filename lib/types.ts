// ============================================================================
//  Tipos de la base de datos (single-tenant: una sola barbería).
// ============================================================================

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "no_show"
  | "cancelled";

export interface Settings {
  id: number;
  name: string;
  tagline: string | null;
  phone: string | null;
  address: string | null;
  instagram: string | null;
  primary_color: string | null;
  accent_color: string | null;
  about: string | null;
  opening_hours: string | null;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
}

export interface Barber {
  id: string;
  name: string;
  bio: string | null;
  specialty: string | null;
  avatar_url: string | null;
  /** Comisión del barbero en porcentaje (0-100). */
  commission_rate: number;
  active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_id: string | null;
  service_id: string | null;
  barber_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  created_at: string;
}
