"use client";

import { useDoctor } from "@/components/doctor/DoctorProvider";
import { findDoctorPatient } from "@/lib/doctor";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { Card, EmptyState } from "@/components/doctor/DoctorUI";

export default function EndRequestForm({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  if (!patient) return <PatientUnavailable />;
  return (
    <>
      <PatientNavigation patient={patient} />
      <Card title="임신 관리 종료">
        <EmptyState
          title="관리 종료 API 연결 예정"
          description="현재 화면에서는 임신 상태나 담당 연결을 변경하지 않습니다."
        />
      </Card>
    </>
  );
}
