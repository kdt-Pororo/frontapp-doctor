export type ClosureOutcome = "PREMATUREBIRTH" | "ABORTION" | "FULLTERM";
export interface ClosureItem {
  fetus_id: number;
  fetus_name: string;
  outcome: ClosureOutcome;
  ended_on: string;
}
export interface ClosureRequest {
  id: number;
  pregnancy_id: number;
  status: "CONSIDERING" | "ACCEPT" | "REJECT" | "CANCELLED";
  doctor_name: string;
  doctor_hospital: string;
  requested_at: string;
  note: string;
  reviewed_at: string | null;
  decision_note: string;
  items: ClosureItem[];
}
export interface ClosureContext {
  active: boolean;
  pregnancy_status: string;
  ended_on: string | null;
  has_pending: boolean;
  legacy_review_required: boolean;
  fetuses: { id: number; name: string }[];
  requests: ClosureRequest[];
  limit: number;
}
export interface ClosureCreate {
  submission_key: string;
  note: string;
  items: { fetus_id: number; outcome: ClosureOutcome; ended_on: string }[];
}
