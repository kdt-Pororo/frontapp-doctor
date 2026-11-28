import type {
  DoctorWorkspaceState,
  DoctorPatient,
} from "@/types/doctor/doctor.type";

export function findDoctorPatient(
  state: DoctorWorkspaceState,
  id: string,
): DoctorPatient | undefined {
  return state.patients.find((patient) => patient.id === id);
}

export function doctorDate(value: string) {
  return value ? value.slice(0, 10).replaceAll("-", ".") : "—";
}

export function todayKST() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function weekLabel(patient: DoctorPatient) {
  if (patient.weeks === null || patient.days === null) return "주수 기록 없음";
  return `${patient.weeks}주 ${patient.days}일`;
}
export function pregnancyStatusLabel(patient: DoctorPatient) {
  return patient.status === "active"
    ? "임신 중"
    : patient.pregnancyStatus === "BIRTH"
      ? "출산 완료"
      : "임신 종료";
}
