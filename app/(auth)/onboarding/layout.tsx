import type { ReactNode } from "react";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import DoctorOnboardingProvider from "./_components/DoctorOnboardingProvider";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return <DoctorAuthFrame><DoctorOnboardingProvider>{children}</DoctorOnboardingProvider></DoctorAuthFrame>;
}
