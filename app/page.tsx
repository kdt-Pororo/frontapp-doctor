import { redirect } from "next/navigation";

// 즉시 화면을 그리는 대신 로그인 경로로 이동하는 진입 전용 페이지입니다.
export const instant = false;

export default function Page() {
  // 인증 연결 후에는 가입·검증 상태를 확인해 대시보드 또는 검증 상태로 분기합니다.
  redirect("/login");
}
