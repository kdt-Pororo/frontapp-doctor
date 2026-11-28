import type { ReactNode } from "react";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import DoctorOnboardingProvider from "./_components/DoctorOnboardingProvider";

// 인증 확인이 끝난 뒤 표시하는 화면이므로 즉시 탐색 검증에서 제외합니다.
export const instant = false;

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return <DoctorAuthFrame><DoctorOnboardingProvider>{children}</DoctorOnboardingProvider></DoctorAuthFrame>;
}
