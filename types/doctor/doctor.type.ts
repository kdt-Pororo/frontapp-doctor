// 의료진 화면에서 사용하는 상태 타입입니다. API DTO는 doctor-patient.type.ts에서 관리합니다.
export interface DoctorProfile {
  id?: number;
  name: string;
  nickname: string;
  phone: string;
  hospital: string;
  department: string;
  license: string;
  verification: "pending" | "revision" | "verified";
}

export interface DoctorPatient {
  id: string;
  name: string;
  babyName: string;
  weeks: number;
  days: number;
  dueDate: string;
  phone: string;
  status: "active" | "ended";
  connection: "approved" | "pending" | "unlinked" | "revoked";
  endedOn?: string;
}

export interface DoctorWorkspaceState {
  profile: DoctorProfile;
  patients: DoctorPatient[];
}

export interface DoctorPatientPageProps {
  params: Promise<{ pregnancyId: string }>;
}
