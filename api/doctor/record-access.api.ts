import { doctorWorkspaceRequest as request } from "./doctor-patient.api";
import type {
  DirectoryResult,
  RecordAccess,
  SharedRecordList,
  SharedRecordDetail,
  SharedRecordHistory,
} from "@/types/doctor/record-access.type";
const base = (id: string) => `/directory/${encodeURIComponent(id)}`;
export const searchPatientsApi = (
  query: string,
  page = 1,
  signal?: AbortSignal,
) =>
  request<DirectoryResult>(
    `/directory?query=${encodeURIComponent(query)}&page=${page}`,
    "GET",
    undefined,
    signal,
  );
export const requestRecordAccessApi = (
  id: number,
  values: { purpose: string; submission_key: string },
) =>
  request<RecordAccess>(`${base(String(id))}/access-requests`, "POST", values);
export const cancelRecordAccessApi = (id: number, accessId: number) =>
  request<RecordAccess>(
    `${base(String(id))}/access-requests/${accessId}/cancel`,
    "POST",
    {},
  );
export const getSharedRecordsApi = (
  id: string,
  page = 1,
  signal?: AbortSignal,
) =>
  request<SharedRecordList>(
    `${base(id)}/records?page=${page}`,
    "GET",
    undefined,
    signal,
  );
export const getSharedRecordApi = (
  id: string,
  recordId: string,
  signal?: AbortSignal,
) =>
  request<SharedRecordDetail>(
    `${base(id)}/records/${encodeURIComponent(recordId)}`,
    "GET",
    undefined,
    signal,
  );
export const getSharedHistoryApi = (
  id: string,
  recordId: string,
  page = 1,
  signal?: AbortSignal,
) =>
  request<SharedRecordHistory>(
    `${base(id)}/records/${encodeURIComponent(recordId)}/history?page=${page}`,
    "GET",
    undefined,
    signal,
  );
