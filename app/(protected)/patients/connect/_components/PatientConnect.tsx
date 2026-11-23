"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Link2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  inputClass,
  PageHeader,
} from "@/components/doctor/DoctorUI";
import { EXAMPLE_PATIENT_CODE } from "@/app/_data/doctor-demo";
import { doctorDate } from "@/lib/doctor";

export default function PatientConnect() {
  const { state, notify, registerCode, approveConnection, cancelConnection } =
    useDoctor();
  const [code, setCode] = useState("");
  const [generated, setGenerated] = useState("");
  const requests = state.connectionRequests.filter(
    (request) => request.status === "pending",
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (registerCode(code)) setCode("");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(generated);
      notify("시연 코드를 복사했습니다.");
    } catch {
      notify(
        "복사 권한을 확인하거나 코드를 직접 선택해 복사해 주세요.",
        "error",
      );
    }
  }

  return (
    <>
      <PageHeader
        title="산모 연결"
        description="앱을 사용하는 산모와 코드를 주고받고, 산모의 확인 후 연결합니다."
      />
      <div className="mb-7 flex items-center gap-4 rounded-2xl border border-[#DAEAE5] bg-[#EAF6F1] px-6 py-5">
        <ShieldCheck size={23} className="shrink-0 text-[#6CA394]" />
        <p className="text-sm leading-6 text-[#648A7D]">
          연결 코드 등록 후에도 산모의 확인과 정보 제공 동의가 필요합니다. 승인
          전에는 건강 기록에 접근할 수 없습니다.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card
          title="내 연결 코드 발급"
          description="산모에게 전달할 코드를 발급합니다."
        >
          <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#CCDCD9] bg-[#F7FAF9] px-5">
            {generated ? (
              <>
                <Badge tone="neutral">시연 코드</Badge>
                <p className="mt-3 font-pretendard text-2xl font-semibold tracking-wider text-[#318C80]">
                  {generated}
                </p>
                <p className="mt-2 text-xs text-[#97ABA3]">
                  이 화면에서만 발급한 코드입니다.
                </p>
              </>
            ) : (
              <>
                <Link2 size={27} className="mb-3 text-[#A1BDB5]" />
                <p className="text-sm text-[#91A69F]">
                  아직 발급한 코드가 없습니다.
                </p>
              </>
            )}
          </div>
          <div className="mt-5 flex gap-2">
            <Button
              onClick={() => {
                setGenerated(
                  `NST-DEMO-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
                );
                notify(
                  "실제 서비스에 연결되지 않는 시연 코드를 발급했습니다.",
                  "info",
                );
              }}
            >
              <Plus size={16} />
              {generated ? "코드 재발급" : "코드 발급"}
            </Button>
            <Button variant="secondary" disabled={!generated} onClick={copy}>
              <Copy size={15} />
              복사
            </Button>
          </div>
        </Card>
        <Card
          title="산모 코드 등록"
          description="산모가 발급한 코드를 입력해 연결 요청을 보냅니다."
        >
          <form onSubmit={submit} className="flex h-full flex-col">
            <Field label="연결 코드">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
                placeholder="산모에게 받은 코드를 입력하세요"
                className={`${inputClass} font-pretendard`}
              />
            </Field>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F5F7F9] px-4 py-3 text-xs text-[#8A9CA7]">
              <span>시연용 코드 · {EXAMPLE_PATIENT_CODE}</span>
              <button
                type="button"
                onClick={() => setCode(EXAMPLE_PATIENT_CODE)}
                className="font-semibold text-[#388D82]"
              >
                예시 코드 입력
              </button>
            </div>
            <div className="mt-6">
              <Button type="submit">
                연결 요청
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <div className="mt-7">
        <Card
          title="산모 확인 대기"
          description="코드를 등록한 뒤 산모의 확인을 기다리는 연결입니다."
          action={<Badge tone="amber">{requests.length}건</Badge>}
        >
          {requests.length ? (
            <div className="divide-y divide-[#EDF1F3]">
              {requests.map((request) => {
                const patient = state.patients.find(
                  (p) => p.id === request.patientId,
                )!;
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex size-11 items-center justify-center rounded-full bg-[#F0F5F5] text-sm font-semibold text-[#7F9C9C]">
                        {patient.name.slice(0, 1)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{patient.name}</p>
                        <p className="mt-1.5 text-xs text-[#9AAAB3]">
                          요청일 {doctorDate(request.date)} · 승인 전 기록
                          비공개
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => cancelConnection(request.id)}
                      >
                        요청 취소
                      </Button>
                      <Button onClick={() => approveConnection(request.id)}>
                        <Check size={15} />
                        산모 승인 시연
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="확인 대기 중인 연결이 없습니다" />
          )}
          <p className="mt-6 border-t border-[#EDF1F3] pt-4 text-xs leading-5 text-[#98A9B2]">
            ‘산모 승인 시연’은 산모가 자신의 앱에서 승인한 상황을 재현합니다.
            실제 연결이나 동의를 대신 처리하지 않습니다.
          </p>
        </Card>
      </div>
    </>
  );
}
