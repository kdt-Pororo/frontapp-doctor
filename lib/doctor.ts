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
  return `${patient.weeks}주 ${patient.days}일`;
}
export function nextAppointment(
  state: DoctorWorkspaceState,
  patientId: string,
) {
  return state.appointments
    .filter(
      (item) => item.patientId === patientId && item.status === "scheduled",
    )
    .sort((a, b) =>
      `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
    )[0];
}
export function latestExam(state: DoctorWorkspaceState, patientId: string) {
  return state.records
    .filter((item) => item.patientId === patientId)
    .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))[0];
}
