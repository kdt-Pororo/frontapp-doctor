// /doctors/auth/workspace/connections 응답 DTO
export interface DoctorPatientDTO {
  pregnancy_id: number;
  mother_name: string;
  mother_phone: string;
  baby_names: string[];
  weeks: number | null;
  days: number | null;
  due_date: string | null;
  status: "active" | "ended";
  ended_on: string | null;
  pregnancy_status: string;
}

export interface DoctorCareRequestDTO {
  id: number;
  pregnancy_id: number;
  mother_name: string;
  requested_at: string;
}

export interface DoctorConnectionsDTO {
  patients: DoctorPatientDTO[];
  requests: DoctorCareRequestDTO[];
}
