import type {
  DoctorDemoState,
  DoctorPatient,
} from "@/types/doctor/doctor.type";

export function findDoctorPatient(
  state: DoctorDemoState,
  id: string,
): DoctorPatient | undefined {
  // 이전 구성안의 preview 주소도 시연 첫 번째 산모로 열 수 있게 유지합니다.
  return state.patients.find(
    (patient) => patient.id === (id === "preview" ? "PG-1024" : id),
  );
}

export function doctorDate(value: string) {
  return value.slice(0, 10).replaceAll("-", ".");
}
export function weekLabel(patient: DoctorPatient) {
  return `${patient.weeks}주 ${patient.days}일`;
}
export function nextAppointment(state: DoctorDemoState, patientId: string) {
  return state.appointments
    .filter(
      (item) => item.patientId === patientId && item.status === "scheduled",
    )
    .sort((a, b) =>
      `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
    )[0];
}
export function latestExam(state: DoctorDemoState, patientId: string) {
  return state.records
    .filter((item) => item.patientId === patientId)
    .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))[0];
}
