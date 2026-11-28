import { Suspense } from "react";
import type { DoctorPatientPageProps } from "@/types/doctor/doctor.type";
import EndRequestForm from "./_components/EndRequestForm";

// 인증 확인이 끝난 뒤 표시하는 화면이므로 즉시 탐색 검증에서 제외합니다.
export const instant = false;

export default function Page(props: DoctorPatientPageProps) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-slate-400">
          산모 정보를 불러오는 중입니다.
        </p>
      }
    >
      <PatientContent {...props} />
    </Suspense>
  );
}

async function PatientContent({ params }: DoctorPatientPageProps) {
  const { pregnancyId } = await params;
  return <EndRequestForm pregnancyId={pregnancyId} />;
}
