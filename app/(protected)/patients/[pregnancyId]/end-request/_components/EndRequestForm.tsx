"use client";

import { useState, type FormEvent } from "react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Field,
  inputClass,
} from "@/components/doctor/DoctorUI";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { doctorDate, findDoctorPatient } from "@/lib/doctor";
import { DEMO_DATE } from "@/app/_data/doctor-demo";

export default function EndRequestForm({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state, requestEnd, cancelEnd, completeEnd, notify } = useDoctor();
  const [draft, setDraft] = useState<{
    date: string;
    reason: string;
    note: string;
  } | null>(null);
  const [simulation, setSimulation] = useState<"mother" | "doctor" | null>(
    null,
  );
  const patient = findDoctorPatient(state, pregnancyId);
  if (!patient || patient.connection !== "approved")
    return <PatientUnavailable />;
  const pending = state.endRequests.find(
    (r) => r.patientId === patient.id && r.status === "pending",
  );
  const history = state.endRequests.filter((r) => r.patientId === patient.id);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setDraft({
      date: String(data.get("date")),
      reason: String(data.get("reason")),
      note: String(data.get("note")).trim(),
    });
  }
  return (
    <>
      <PatientNavigation patient={patient} />
      <div className="mb-6 rounded-xl border border-[#E8E1D4] bg-[#FBF6EC] p-5 text-sm leading-7 text-[#948363]">
        임신 관리 종료는 앱의 기록·일정 관리 상태를 변경하는 기능입니다. 산모는
        의료진의 승인 없이 직접 종료할 수 있습니다. 의료진 요청 후 산모 확인
        방식은 검토안으로 시연합니다.
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
        <Card
          title={
            patient.status === "ended"
              ? "임신 관리가 종료되었습니다"
              : pending
                ? "산모 확인 대기"
                : "임신 관리 종료 요청"
          }
          description="담당 연결 해제와 임신 관리 종료는 다른 기능입니다."
        >
          {patient.status === "ended" ? (
            <>
              <Badge tone="neutral">관리 종료</Badge>
              <p className="mt-5 text-sm text-[#7C919E]">
                종료일 {doctorDate(patient.endedOn ?? "")} · 기존 기록은
                보존되며 새 검진과 일정 등록이 중지됩니다.
              </p>
            </>
          ) : pending ? (
            <>
              <Badge tone="amber">확인 대기</Badge>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-[#93A5B0]">종료 예정일</dt>
                  <dd className="mt-1">{doctorDate(pending.date)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#93A5B0]">사유</dt>
                  <dd className="mt-1">{pending.reason}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#93A5B0]">메모</dt>
                  <dd className="mt-1 whitespace-pre-wrap">
                    {pending.note || "없음"}
                  </dd>
                </div>
              </dl>
              <Button
                variant="secondary"
                className="mt-6"
                onClick={() => cancelEnd(pending.id)}
              >
                요청 취소
              </Button>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <Field label="종료일 *">
                  <input
                    name="date"
                    type="date"
                    required
                    max={DEMO_DATE}
                    defaultValue={DEMO_DATE}
                    className={inputClass}
                  />
                </Field>
                <Field label="종료 사유 *">
                  <select name="reason" required className={inputClass}>
                    <option value="">선택해 주세요</option>
                    <option>출산</option>
                    <option>유산·사산</option>
                    <option>기타 관리 종료</option>
                  </select>
                </Field>
              </div>
              <Field label="산모에게 전달할 내용">
                <textarea
                  name="note"
                  rows={5}
                  maxLength={2000}
                  placeholder="관리 종료에 대한 안내를 입력해 주세요."
                  className={inputClass}
                />
              </Field>
              <div className="flex justify-end">
                <Button type="submit">종료 요청 확인</Button>
              </div>
            </form>
          )}
        </Card>
        <Card title="종료 이후에는">
          <ul className="space-y-5 text-sm text-[#7A919D]">
            <li>기존 검진·증상·예측 이력 열람</li>
            <li>새 검진과 다음 일정 등록 중지</li>
            <li>남아 있는 방문 일정 취소</li>
            <li>연결을 해제하려면 산모 개요에서 별도 진행</li>
          </ul>
        </Card>
      </div>
      <Card title="처리 이력" className="mt-6">
        {history.length ? (
          <div className="divide-y divide-[#EDF1F3]">
            {history.map((r) => (
              <div key={r.id} className="flex justify-between py-3 text-sm">
                <span>
                  {doctorDate(r.date)} · {r.reason}
                </span>
                <Badge tone={r.status === "completed" ? "neutral" : "amber"}>
                  {r.status === "pending"
                    ? "확인 대기"
                    : r.status === "cancelled"
                      ? "취소"
                      : "종료 완료"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#9BACB5]">종료 요청 이력이 없습니다.</p>
        )}
      </Card>
      {patient.status === "active" && (
        <details className="mt-6 rounded-xl border border-dashed border-[#D5E0E5] p-5">
          <summary className="cursor-pointer text-xs font-medium text-[#8B9EA8]">
            시연용 상태 변경 · 실제 산모에게 전송되지 않습니다
          </summary>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={() => setSimulation("mother")}>
              산모 단독 종료 시연
            </Button>
            {pending && (
              <Button
                variant="secondary"
                onClick={() => setSimulation("doctor")}
              >
                산모가 요청 확인한 상황 시연
              </Button>
            )}
          </div>
        </details>
      )}
      {draft && (
        <Dialog title="종료 요청을 남길까요?" onClose={() => setDraft(null)}>
          <p className="text-sm leading-7 text-[#7C919D]">
            {patient.name} · {doctorDate(draft.date)} · {draft.reason}
            <br />이 단계에서는 관리가 종료되지 않고 산모 확인 대기로
            표시됩니다.
          </p>
          <div className="mt-7 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDraft(null)}>
              돌아가기
            </Button>
            <Button
              onClick={() => {
                try {
                  requestEnd(patient.id, draft.date, draft.reason, draft.note);
                  setDraft(null);
                } catch (error) {
                  notify(
                    error instanceof Error
                      ? error.message
                      : "처리할 수 없습니다.",
                    "error",
                  );
                }
              }}
            >
              시연 요청 남기기
            </Button>
          </div>
        </Dialog>
      )}
      {simulation && (
        <Dialog
          title="관리 종료 상태를 시연할까요?"
          onClose={() => setSimulation(null)}
        >
          <p className="text-sm leading-7 text-[#7C919D]">
            {simulation === "mother"
              ? "산모가 단독으로 종료한 상황"
              : "산모가 의료진의 요청을 확인한 상황"}
            을 반영합니다. 현재 시연에서 새 기록 등록과 남은 일정이 중지됩니다.
          </p>
          <div className="mt-7 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSimulation(null)}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                completeEnd(patient.id, simulation);
                setSimulation(null);
              }}
            >
              종료 상태 시연
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
