"use client";
import { useEffect, useRef, useState } from "react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import { findDoctorPatient, doctorDate } from "@/lib/doctor";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
} from "@/components/doctor/DoctorUI";
import {
  getClosureApi,
  cancelClosureApi,
} from "@/api/doctor/doctor-closure.api";
import type {
  ClosureContext,
  ClosureRequest,
} from "@/types/doctor/doctor-closure.type";
import { appointmentDate } from "@/lib/doctor-appointment";
import ClosureForm from "./ClosureForm";

const statusLabels = {
  CONSIDERING: "산모 확인 대기",
  ACCEPT: "종료 확정",
  REJECT: "산모 반려",
  CANCELLED: "요청 취소",
};
const outcomeLabels = {
  FULLTERM: "만삭 출산",
  PREMATUREBIRTH: "조산",
  ABORTION: "유산",
};
export default function EndRequestForm({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state, notify, refreshConnections } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data?: ClosureContext;
    error?: string;
  }>();
  const [cancel, setCancel] = useState<ClosureRequest>();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const enabled = Boolean(patient);
  const key = `${pregnancyId}:${revision}`;
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    getClosureApi(pregnancyId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error:
              cause instanceof Error
                ? cause.message
                : "종료 정보를 확인하지 못했습니다.",
          });
      });
    return () => controller.abort();
  }, [pregnancyId, enabled, key]);
  const current = result?.key === key ? result : undefined;
  const data = current?.data;
  function refresh() {
    setRevision((v) => v + 1);
    refreshConnections();
  }
  async function cancelRequest() {
    if (!cancel || lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await cancelClosureApi(pregnancyId, cancel.id);
      notify("종료 요청을 취소했습니다.");
    } catch (cause) {
      notify(
        cause instanceof Error ? cause.message : "취소하지 못했습니다.",
        "error",
      );
    } finally {
      lock.current = false;
      setBusy(false);
      setCancel(undefined);
      refresh();
    }
  }
  if (!patient) return <PatientUnavailable />;
  return (
    <>
      <PatientNavigation patient={patient} />
      <Card
        title="임신 종료 요청·이력"
        action={
          <Button variant="secondary" disabled={busy} onClick={refresh}>
            최신 상태 확인
          </Button>
        }
      >
        <p className="mb-6 text-sm leading-7 text-[#6F8793]">
          의료진이 종료 내용을 요청하고 산모 본인이 확인·수락하면 종료가
          확정됩니다. 요청만 보낸 상태에서는 검진과 일정 등록을 계속할 수
          있습니다.
        </p>
        {!current ? (
          <p role="status" className="py-10 text-center text-sm text-[#8297A2]">
            종료 정보를 확인하고 있습니다.
          </p>
        ) : current.error ? (
          <p role="alert" className="text-sm text-red-700">
            {current.error}
          </p>
        ) : (
          data && (
            <>
              {!data.active ? (
                <div className="mb-6 rounded-xl bg-[#F1F6F8] p-5 text-sm">
                  {data.pregnancy_status === "BIRTH"
                    ? "출산 완료"
                    : "임신 종료"}{" "}
                  · 종료일 {doctorDate(data.ended_on ?? "")}
                  <p className="mt-2 text-[#6F8793]">
                    이전 임신에서 기록을 열람할 수 있습니다. 예정된 방문 일정은
                    자동 취소하지 않습니다.
                  </p>
                </div>
              ) : data.legacy_review_required ? (
                <p className="mb-6 rounded-xl bg-amber-50 p-5 text-sm text-amber-800">
                  이전 방식의 종료 기록이 있어 확인이 필요합니다. 새 요청으로
                  덮어쓰지 않습니다.
                </p>
              ) : data.has_pending ? (
                <p className="mb-6 rounded-xl bg-[#EDF7F5] p-5 text-sm text-[#168B86]">
                  이 임신에는 산모가 확인 중인 종료 요청이 있습니다. 본인의
                  요청은 아래에서 취소 후 다시 작성할 수 있습니다.
                </p>
              ) : data.fetuses.length === 0 ? (
                <EmptyState
                  title="등록된 태아 정보가 없습니다"
                  description="태아 정보 확인 후 종료를 요청해 주세요."
                />
              ) : (
                <ClosureForm
                  key={revision}
                  pregnancyId={pregnancyId}
                  fetuses={data.fetuses}
                  done={() => {
                    notify("산모에게 종료 확인을 요청했습니다.");
                    refresh();
                  }}
                />
              )}
              <div className="mt-8 border-t border-[#E7EDF1] pt-6">
                <h2 className="mb-5 font-semibold">내가 보낸 요청 이력</h2>
                {data.requests.length === 0 ? (
                  <p className="py-6 text-sm text-[#8297A2]">
                    보낸 종료 요청이 없습니다.
                  </p>
                ) : (
                  <ul className="space-y-5">
                    {data.requests.map((request) => (
                      <li
                        key={request.id}
                        className="rounded-xl border border-[#E0E8EC] p-5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#8297A2]">
                            요청 #{request.id} ·{" "}
                            {appointmentDate(request.requested_at)}
                          </span>
                          <Badge
                            tone={
                              request.status === "CONSIDERING"
                                ? "amber"
                                : "neutral"
                            }
                          >
                            {statusLabels[request.status]}
                          </Badge>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm">
                          {request.items.map((item) => (
                            <li key={item.fetus_id}>
                              {item.fetus_name} · {outcomeLabels[item.outcome]}{" "}
                              · {doctorDate(item.ended_on)}
                            </li>
                          ))}
                        </ul>
                        {request.note && (
                          <p className="mt-4 whitespace-pre-wrap text-sm text-[#6F8793]">
                            전달 내용 · {request.note}
                          </p>
                        )}
                        {request.decision_note && (
                          <p className="mt-3 whitespace-pre-wrap text-sm text-[#6F8793]">
                            산모 확인 내용 · {request.decision_note}
                          </p>
                        )}
                        {request.reviewed_at && (
                          <p className="mt-3 text-xs text-[#8297A2]">
                            처리 시각 · {appointmentDate(request.reviewed_at)}
                          </p>
                        )}
                        {request.status === "CONSIDERING" && data.active && (
                          <div className="mt-4">
                            <Button
                              variant="danger"
                              disabled={busy}
                              onClick={() => setCancel(request)}
                            >
                              종료 요청 취소
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-5 text-xs text-[#8297A2]">
                  최근 {data.limit}개 요청까지 표시합니다.
                </p>
              </div>
            </>
          )
        )}
      </Card>
      {cancel && (
        <Dialog
          title="종료 요청을 취소할까요?"
          onClose={() => {
            if (!busy) setCancel(undefined);
          }}
        >
          <p className="max-w-md text-sm leading-7">
            요청 #{cancel.id}을 취소합니다. 임신 상태는 바뀌지 않으며 요청
            이력은 남습니다.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setCancel(undefined)}
            >
              유지
            </Button>
            <Button variant="danger" disabled={busy} onClick={cancelRequest}>
              {busy ? "처리 중" : "요청 취소 확정"}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
