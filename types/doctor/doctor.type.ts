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

export interface ExamRecord {
  id: string;
  patientId: string;
  visitedAt: string;
  title: string;
  notes: string;
  results: string;
  bloodPressure: string;
  weight: string;
  predictionStatus: "demo" | "not-configured";
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  title: string;
  status: "scheduled" | "cancelled";
}

export interface SymptomEntry {
  id: string;
  patientId: string;
  date: string;
  title: string;
  content: string;
}

export interface RiskObservation {
  recordId: string;
  patientId: string;
  date: string;
  maternal: number;
  preterm: number;
  version: string;
}

export interface ConnectionRequest {
  id: string;
  patientId: string;
  date: string;
  status: "pending" | "approved" | "cancelled";
}

export interface EndRequest {
  id: string;
  patientId: string;
  date: string;
  reason: string;
  note: string;
  status: "pending" | "cancelled" | "completed";
  source: "doctor" | "mother";
}

export interface DoctorWorkspaceState {
  profile: DoctorProfile;
  patients: DoctorPatient[];
  records: ExamRecord[];
  appointments: Appointment[];
  symptoms: SymptomEntry[];
  observations: RiskObservation[];
  connectionRequests: ConnectionRequest[];
  endRequests: EndRequest[];
}

export interface ExamInput {
  patientId: string;
  visitedAt: string;
  title: string;
  notes: string;
  results: string;
  bloodPressure: string;
  weight: string;
  nextDate: string;
  nextTime: string;
  nextTitle: string;
}

export interface DoctorPatientPageProps {
  params: Promise<{ pregnancyId: string }>;
}
