// /doctors/auth/workspace/connections 응답 DTO
export interface DoctorPatientDTO {
  pregnancy_id: number;
  mother_name: string;
  mother_phone: string;
  baby_names: string[];
  weeks: number;
  days: number;
  due_date: string | null;
  status: "active" | "ended";
  ended_on: string | null;
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
