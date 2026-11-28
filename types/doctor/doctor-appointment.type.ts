export type AppointmentScope = "upcoming" | "past" | "cancelled";
export interface DoctorAppointment {
  id: number;
  pregnancy_id: number;
  scheduled_at: string;
  title: string;
  memo: string;
  status: "SCHEDULED" | "CANCELLED";
  version: number;
  updated_at: string;
  cancelled_at: string | null;
}
export interface AppointmentList {
  items: DoctorAppointment[];
  counts: Record<AppointmentScope, number>;
  total: number;
  page: number;
  page_size: number;
  read_only: boolean;
}
export interface AppointmentValues {
  scheduled_at: string;
  title: string;
  memo: string;
}
export interface TodayAppointments {
  date: string;
  total: number;
  limit: number;
  items: (DoctorAppointment & { mother_name: string })[];
}
