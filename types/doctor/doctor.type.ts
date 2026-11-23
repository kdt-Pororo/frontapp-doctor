// 프론트 시연용 데이터입니다. 백엔드 DTO가 확정되면 API 응답 타입과 별도로 연결합니다.
export interface DoctorProfile {
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

export interface DoctorDemoState {
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
