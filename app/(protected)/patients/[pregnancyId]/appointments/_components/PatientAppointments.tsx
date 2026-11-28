"use client";
import { useRef, useState } from "react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { Badge, Button, Card, EmptyState } from "@/components/doctor/DoctorUI";
import { findDoctorPatient } from "@/lib/doctor";
import { appointmentDate } from "@/lib/doctor-appointment";
import { cancelAppointmentApi } from "@/api/doctor/doctor-appointment.api";
import type {
  AppointmentScope,
  DoctorAppointment,
} from "@/types/doctor/doctor-appointment.type";
import useAppointments from "../../_components/useAppointments";
import AppointmentForm from "./AppointmentForm";

export default function PatientAppointments({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state, notify } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const [scope, setScope] = useState<AppointmentScope>("upcoming");
  const [page, setPage] = useState(1);
  const { data, loading, error, refresh } = useAppointments(
    pregnancyId,
    Boolean(patient),
    scope,
    page,
  );
  const [editor, setEditor] = useState<DoctorAppointment | null | undefined>();
  const [confirm, setConfirm] = useState<number>();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const readOnly = patient?.status === "ended" || Boolean(data?.read_only);
  async function cancel(row: DoctorAppointment) {
    if (lock.current || readOnly) return;
    lock.current = true;
    setBusy(true);
    try {
      await cancelAppointmentApi(pregnancyId, row.id, row.version);
      notify("방문 일정을 취소했습니다.");
      setConfirm(undefined);
      setPage(1);
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "취소하지 못했습니다.",
        "error",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      refresh();
    }
  }
  if (!patient) return <PatientUnavailable />;
  return (
    <>
      <PatientNavigation patient={patient} />
      <Card
        title="방문 일정"
        action={
          !readOnly && (
            <Button
              disabled={busy || loading || Boolean(error)}
              onClick={() => {
                setEditor(null);
                setConfirm(undefined);
              }}
            >
              + 일정 등록
            </Button>
          )
        }
      >
        <p className="mb-6 text-sm text-[#8297A2]">
          한국 시간 기준으로 등록합니다. 지난 일정은 방문 완료 여부를 의미하지
          않습니다.
        </p>
        <div className="mb-6 flex items-center gap-3 border-b border-[#E7EDF1] pb-5">
          {(
            [
              { key: "upcoming", label: "방문 예정" },
              { key: "past", label: "지난 일정" },
              { key: "cancelled", label: "취소" },
            ] as const
          ).map((tab) => (
            <Button
              key={tab.key}
              aria-pressed={scope === tab.key}
              disabled={busy}
              variant={scope === tab.key ? "primary" : "secondary"}
              onClick={() => {
                setScope(tab.key);
                setPage(1);
                setEditor(undefined);
                setConfirm(undefined);
              }}
            >
              {tab.label} {data?.counts[tab.key] ?? "—"}
            </Button>
          ))}
          <Button variant="ghost" disabled={busy} onClick={refresh}>
            새로 확인
          </Button>
        </div>
        {editor !== undefined && (
          <AppointmentForm
            key={editor?.id ?? "new"}
            pregnancyId={pregnancyId}
            appointment={editor}
            readOnly={readOnly}
            onBusy={setBusy}
            close={() => {
              setEditor(undefined);
              refresh();
            }}
            done={() => {
              setEditor(undefined);
              setScope("upcoming");
              setPage(1);
              refresh();
              notify("방문 일정을 저장했습니다.");
            }}
          />
        )}
        {readOnly && (
          <p className="mb-5 text-sm text-[#8297A2]">
            이전 임신 · 등록된 일정만 열람할 수 있습니다.
          </p>
        )}
        {loading ? (
          <p role="status" className="py-12 text-center text-sm text-[#8297A2]">
            일정을 불러오고 있습니다.
          </p>
        ) : error ? (
          <p role="alert" className="py-8 text-sm text-red-700">
            {error}
          </p>
        ) : data?.items.length === 0 ? (
          <EmptyState
            title="해당하는 방문 일정이 없습니다"
            description="등록한 일정은 선택한 상태에 따라 표시됩니다."
          />
        ) : (
          <ul className="divide-y divide-[#E7EDF1]">
            {data?.items.map((row) => (
              <li key={row.id} className="py-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-[#168B86]">
                      {appointmentDate(row.scheduled_at)}
                    </p>
                    <h3 className="mt-3 font-semibold">{row.title}</h3>
                    {row.memo && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6F8793]">
                        {row.memo}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {row.status === "CANCELLED" ? (
                      <Badge tone="neutral">취소됨</Badge>
                    ) : (
                      !readOnly && (
                        <>
                          <Button
                            disabled={busy}
                            variant="secondary"
                            onClick={() => {
                              setEditor(row);
                              setConfirm(undefined);
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            disabled={busy}
                            variant="danger"
                            onClick={() => {
                              setConfirm(row.id);
                              setEditor(undefined);
                            }}
                          >
                            일정 취소
                          </Button>
                        </>
                      )
                    )}
                  </div>
                </div>
                {row.cancelled_at && (
                  <p className="mt-3 text-xs text-[#8297A2]">
                    취소 처리 · {appointmentDate(row.cancelled_at)}
                  </p>
                )}
                {confirm === row.id && (
                  <div
                    role="alert"
                    className="mt-4 flex items-center justify-between rounded-xl bg-[#FFF5EF] p-4 text-sm"
                  >
                    <p>이 방문 일정을 취소할까요? 취소 이력은 보관됩니다.</p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() => setConfirm(undefined)}
                      >
                        유지
                      </Button>
                      <Button
                        variant="danger"
                        disabled={busy}
                        onClick={() => cancel(row)}
                      >
                        {busy ? "처리 중" : "일정 취소 확정"}
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {data && (data.total > data.page_size || page > 1) && (
          <div className="mt-5 flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              disabled={page === 1 || busy}
              onClick={() => setPage(page - 1)}
            >
              이전
            </Button>
            <span className="text-sm">
              {page} / {Math.max(1, Math.ceil(data.total / data.page_size))}
            </span>
            <Button
              variant="secondary"
              disabled={page * data.page_size >= data.total || busy}
              onClick={() => setPage(page + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </Card>
    </>
  );
}
