import { doctorWorkspaceRequest as request } from "./doctor-patient.api";
import type {
  AppointmentList,
  AppointmentScope,
  AppointmentValues,
  DoctorAppointment,
  TodayAppointments,
} from "@/types/doctor/doctor-appointment.type";
const base = (id: string) =>
  `/pregnancies/${encodeURIComponent(id)}/appointments`;
export const listAppointmentsApi = (
  id: string,
  scope: AppointmentScope = "upcoming",
  page = 1,
  pageSize = 20,
  signal?: AbortSignal,
) =>
  request<AppointmentList>(
    `${base(id)}?scope=${scope}&page=${page}&page_size=${pageSize}`,
    "GET",
    undefined,
    signal,
  );
export const createAppointmentApi = (
  id: string,
  values: AppointmentValues & { submission_key: string },
) => request<DoctorAppointment>(base(id), "POST", values);
export const updateAppointmentApi = (
  id: string,
  appointmentId: number,
  values: AppointmentValues & { expected_version: number },
) => request<DoctorAppointment>(`${base(id)}/${appointmentId}`, "PUT", values);
export const cancelAppointmentApi = (
  id: string,
  appointmentId: number,
  expected_version: number,
) =>
  request<DoctorAppointment>(`${base(id)}/${appointmentId}/cancel`, "POST", {
    expected_version,
  });
export const todayAppointmentsApi = (signal?: AbortSignal) =>
  request<TodayAppointments>("/appointments/today", "GET", undefined, signal);
