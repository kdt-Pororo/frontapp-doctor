import type { DoctorRecordDTO, RecordHistory } from "./doctor-record.type";
export interface RecordAccess {
  id: number;
  pregnancy_id: number;
  status:
    "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "REVOKED" | "EXPIRED";
  scope_version: string;
  purpose: string;
  requested_at: string;
  decided_at: string | null;
  decision_note: string;
  expires_at: string | null;
  revoked_at: string | null;
}
export interface DirectoryResult {
  items: {
    pregnancy_id: number;
    mother_name: string;
    managed: boolean;
    access: RecordAccess | null;
  }[];
  total: number;
  page: number;
  page_size: number;
}
export interface SharedRecordSummary {
  id: number;
  title: string;
  visited_at: string;
  record_version: number;
  author_name: string;
  author_hospital: string;
}
export interface SharedRecordList {
  mother_name: string;
  access: RecordAccess;
  records: SharedRecordSummary[];
  total: number;
  page: number;
  page_size: number;
}
export interface SharedRecordDetail {
  record: DoctorRecordDTO;
  author_name: string;
  author_hospital: string;
  access: RecordAccess;
}
export interface SharedRecordHistory {
  history: RecordHistory;
  author_name: string;
  author_hospital: string;
  access: RecordAccess;
}
