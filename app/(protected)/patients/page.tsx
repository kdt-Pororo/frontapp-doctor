import PatientList from "./_components/PatientList";

// 인증 확인이 끝난 뒤 표시하는 화면이므로 즉시 탐색 검증에서 제외합니다.
export const instant = false;

export default function Page() {
  return <PatientList />;
}
