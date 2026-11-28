import { Suspense } from "react";
import type { DoctorPatientPageProps } from "@/types/doctor/doctor.type";
import PatientAppointments from "./_components/PatientAppointments";
export const instant = false;
export default function Page(props: DoctorPatientPageProps) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-slate-400">
          산모 정보를 확인하고 있습니다.
        </p>
      }
    >
      <Content {...props} />
    </Suspense>
  );
}
async function Content({ params }: DoctorPatientPageProps) {
  const { pregnancyId } = await params;
  return <PatientAppointments pregnancyId={pregnancyId} />;
}
