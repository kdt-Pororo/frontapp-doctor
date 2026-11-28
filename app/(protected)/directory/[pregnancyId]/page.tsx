import { Suspense } from "react";
import SharedClinicalRecords from "./_components/SharedClinicalRecords";
import type { DoctorPatientPageProps } from "@/types/doctor/doctor.type";
export const instant = false;
export default function Page(props: DoctorPatientPageProps) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-slate-400">
          열람 권한을 확인하고 있습니다.
        </p>
      }
    >
      <Content {...props} />
    </Suspense>
  );
}
async function Content({ params }: DoctorPatientPageProps) {
  const { pregnancyId } = await params;
  return <SharedClinicalRecords key={pregnancyId} pregnancyId={pregnancyId} />;
}
