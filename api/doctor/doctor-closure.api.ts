import { doctorWorkspaceRequest as request } from "./doctor-patient.api";
import type {
  ClosureContext,
  ClosureCreate,
  ClosureRequest,
} from "@/types/doctor/doctor-closure.type";
const base = (id: string) => `/pregnancies/${encodeURIComponent(id)}/closure`;
export const getClosureApi = (id: string, signal?: AbortSignal) =>
  request<ClosureContext>(base(id), "GET", undefined, signal);
export const createClosureApi = (id: string, values: ClosureCreate) =>
  request<ClosureRequest>(base(id), "POST", values);
export const cancelClosureApi = (id: string, closureId: number) =>
  request<ClosureRequest>(`${base(id)}/${closureId}/cancel`, "POST", {});
