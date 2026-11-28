import { Suspense, type ReactNode } from "react";
import DoctorAuthGate from "@/components/doctor/DoctorAuthGate";
import DoctorShell from "@/components/doctor/DoctorShell";

// 의료진 세션과 승인 여부를 확인한 뒤 워크스페이스를 표시합니다.
// 인증 확인이 끝난 뒤 표시하는 화면이므로 즉시 탐색 검증에서 제외합니다.
export const instant = false;

export default function DoctorWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F4F7F9] p-10 text-sm text-slate-400">
          의료진 화면을 준비하는 중입니다.
        </main>
      }
    >
      <DoctorAuthGate><DoctorShell>{children}</DoctorShell></DoctorAuthGate>
    </Suspense>
  );
}
