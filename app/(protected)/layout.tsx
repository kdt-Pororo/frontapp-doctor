import { Suspense, type ReactNode } from "react";
import DoctorShell from "@/components/doctor/DoctorShell";

// 인증 여부의 실제 검사는 향후 백엔드 세션과 연결합니다. 현재는 가상 화면 시연입니다.
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
      <DoctorShell>{children}</DoctorShell>
    </Suspense>
  );
}
