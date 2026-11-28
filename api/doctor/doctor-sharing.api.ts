import { doctorWorkspaceRequest } from "./doctor-patient.api";
import type { DoctorSharedContext } from "@/types/doctor/doctor-sharing.type";
export const getSharedContextApi = (
  id: string,
  page = 1,
  signal?: AbortSignal,
) =>
  doctorWorkspaceRequest<DoctorSharedContext>(
    `/pregnancies/${encodeURIComponent(id)}/shared-context?page=${page}&page_size=5`,
    "GET",
    undefined,
    signal,
  );
