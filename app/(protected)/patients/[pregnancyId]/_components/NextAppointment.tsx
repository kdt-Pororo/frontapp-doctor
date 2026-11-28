"use client";
import Link from "next/link";
import { Card } from "@/components/doctor/DoctorUI";
import { appointmentDate } from "@/lib/doctor-appointment";
import useAppointments from "./useAppointments";
export default function NextAppointment({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { data, loading, error, refresh } = useAppointments(
    pregnancyId,
    true,
    "upcoming",
    1,
    1,
  );
  const row = data?.items[0];
  return (
    <Card
      title="다음 방문 일정"
      action={
        <Link
          href={`/patients/${pregnancyId}/appointments`}
          className="text-sm text-[#168B86]"
        >
          일정 관리 →
        </Link>
      }
    >
      {loading ? (
        <p role="status" className="text-sm text-[#8297A2]">
          일정을 확인하고 있습니다.
        </p>
      ) : error ? (
        <div role="alert" className="text-sm text-red-700">
          {error}
          <button onClick={refresh} className="ml-2 underline">
            다시 시도
          </button>
        </div>
      ) : row ? (
        <>
          <p className="text-lg font-semibold">
            {appointmentDate(row.scheduled_at)}
          </p>
          <p className="mt-3 text-sm text-[#6F8793]">{row.title}</p>
          {data?.read_only && (
            <p className="mt-3 text-xs text-[#8297A2]">
              이전 임신에 등록했던 일정입니다.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-[#8297A2]">
          등록된 다음 방문 일정이 없습니다.
        </p>
      )}
    </Card>
  );
}
