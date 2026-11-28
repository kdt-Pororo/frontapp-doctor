"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { todayAppointmentsApi } from "@/api/doctor/doctor-appointment.api";
import { Badge, Card, EmptyState } from "@/components/doctor/DoctorUI";
import { appointmentDate } from "@/lib/doctor-appointment";
import type { TodayAppointments as TodayDTO } from "@/types/doctor/doctor-appointment.type";
export default function TodayAppointments() {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    revision: number;
    data?: TodayDTO;
    error?: string;
  }>();
  useEffect(() => {
    const controller = new AbortController();
    todayAppointmentsApi(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ revision, data });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setResult({
            revision,
            error: cause instanceof Error ? cause.message : "일정 조회 실패",
          });
      });
    return () => controller.abort();
  }, [revision]);
  const current = result?.revision === revision ? result : undefined;
  return (
    <Card
      title="오늘의 방문 일정"
      action={<Badge>{current?.data?.total ?? "—"}건</Badge>}
    >
      {!current ? (
        <p role="status" className="py-8 text-sm text-[#8297A2]">
          일정을 확인하고 있습니다.
        </p>
      ) : current.error ? (
        <p role="alert" className="text-sm text-red-700">
          {current.error}
          <button
            className="ml-2 underline"
            onClick={() => setRevision((v) => v + 1)}
          >
            다시 시도
          </button>
        </p>
      ) : current.data?.total === 0 ? (
        <EmptyState
          title="오늘 등록된 방문 일정이 없습니다"
          description="담당 산모의 방문 일정에서 새 일정을 등록할 수 있습니다."
        />
      ) : (
        <>
          <p className="mb-3 text-xs text-[#8297A2]">
            {current.data?.date} · 한국 시간
          </p>
          <ul className="divide-y divide-[#E7EDF1]">
            {current.data?.items.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/patients/${row.pregnancy_id}/appointments`}
                  className="block py-4"
                >
                  <span className="text-sm font-semibold">
                    {row.mother_name} · {row.title}
                  </span>
                  <span className="mt-2 block text-xs text-[#8297A2]">
                    {appointmentDate(row.scheduled_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {current.data && current.data.total > current.data.limit && (
            <p className="mt-4 text-xs text-[#8297A2]">
              가까운 순 {current.data.limit}건 표시 · 전체 일정은 산모별 방문
              일정에서 확인하세요.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
