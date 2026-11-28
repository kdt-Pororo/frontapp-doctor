"use client";
import { useEffect, useState } from "react";
import { getSharedContextApi } from "@/api/doctor/doctor-sharing.api";
import { Badge, Button, Card } from "@/components/doctor/DoctorUI";
import type { DoctorSharedContext } from "@/types/doctor/doctor-sharing.type";
import type { DoctorPatient } from "@/types/doctor/doctor.type";
import { doctorDate } from "@/lib/doctor";

const conditions: Record<string, string> = {
  VERY_GOOD: "매우 좋음",
  GOOD: "좋음",
  NORMAL: "보통",
  BAD: "나쁨",
  VERY_BAD: "매우 나쁨",
};
const symptoms: Record<string, string> = {
  MORNING_SICKNESS: "입덧",
  HEADACHE: "두통",
  ABDOMINAL_PAIN: "복통",
  BACK_PAIN: "허리 통증",
  EDEMA: "부종",
  FATIGUE: "피로감",
  DIZZINESS: "어지러움",
  HEARTBURN: "속쓰림",
  FETAL_MOVEMENT_CHANGE: "태동 변화",
  SLEEP_PROBLEM: "수면 문제",
  ETC: "기타",
};

export default function SharedPatientInfo({
  patient,
}: {
  patient: DoctorPatient;
}) {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const key = `${patient.id}:${page}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    data?: DoctorSharedContext;
    error?: string;
  }>();
  useEffect(() => {
    const controller = new AbortController();
    getSharedContextApi(patient.id, page, controller.signal)
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
                : "공유 정보를 불러오지 못했습니다.",
          });
      });
    return () => controller.abort();
  }, [patient.id, page, key]);
  const current = result?.key === key ? result : undefined;
  const data = current?.data;
  const records = data?.symptoms;
  return (
    <>
      <Card
        title="연락처"
        action={
          <Button variant="ghost" onClick={() => setRevision((v) => v + 1)}>
            공유 정보 새로 확인
          </Button>
        }
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#E7EDF1] pb-5">
          <span className="text-sm text-[#879BA6]">산모 · {patient.name}</span>
          <span className="font-medium">
            {patient.phone || "연락처 미등록"}
          </span>
        </div>
        <h3 className="mt-5 text-xs font-semibold text-[#879BA6]">
          보호자 연락처
        </h3>
        {!current ? (
          <p role="status" className="mt-4 text-sm text-[#879BA6]">
            공유 상태를 확인하고 있습니다.
          </p>
        ) : current.error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {current.error}
          </p>
        ) : !data?.guardian_contacts.shared ? (
          <p className="mt-4 text-sm leading-6 text-[#879BA6]">
            산모가 이 의료진에게 보호자 연락처를 공유하지 않았습니다.
          </p>
        ) : data.guardian_contacts.items.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-[#879BA6]">
            연락처 공개에 동의한 연결 보호자가 없습니다.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[#E7EDF1]">
            {data.guardian_contacts.items.map((guardian) => (
              <li
                key={guardian.id}
                className="flex items-center justify-between gap-4 py-4 text-sm"
              >
                <span>
                  {guardian.name}{" "}
                  <span className="ml-2 text-xs text-[#879BA6]">보호자</span>
                </span>
                <span className="font-medium">
                  {guardian.phone || "연락처 미등록"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card
        title="공유된 산모 증상"
        action={
          records?.shared && <Badge tone="neutral">{records.total}건</Badge>
        }
      >
        <p className="mb-5 text-xs leading-6 text-[#879BA6]">
          산모가 기록한 컨디션·증상·메모입니다. 의료진 검진 결과와 구분해
          확인하세요.
        </p>
        {!current ? (
          <p role="status" className="py-8 text-sm text-[#879BA6]">
            증상 기록을 확인하고 있습니다.
          </p>
        ) : current.error ? (
          <p className="py-6 text-sm text-[#879BA6]">
            공유 정보를 조회하지 못했습니다. 위의 새로 확인 버튼으로 다시 시도해
            주세요.
          </p>
        ) : !records?.shared ? (
          <p className="py-6 text-sm text-[#879BA6]">
            산모가 이 의료진에게 증상 기록을 공유하지 않았습니다.
          </p>
        ) : records.items.length === 0 ? (
          <p className="py-6 text-sm text-[#879BA6]">
            표시할 증상 기록이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-[#E7EDF1]">
            {records.items.map((record) => (
              <li key={record.id} className="py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {doctorDate(record.recorded_at)}
                  </span>
                  <Badge tone="neutral">
                    컨디션 · {conditions[record.condition] ?? "분류 미확인"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-[#58727F]">
                  {record.symptom_types.length
                    ? record.symptom_types
                        .map((type) => symptoms[type] ?? "분류 미확인 증상")
                        .join(" · ")
                    : "증상 항목 미입력"}
                </p>
                {record.memo ? (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer text-[#168B86]">
                      산모 메모 보기
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-[#6F8793]">
                      {record.memo}
                    </p>
                  </details>
                ) : (
                  <p className="mt-3 text-xs text-[#879BA6]">메모 미입력</p>
                )}
              </li>
            ))}
          </ul>
        )}
        {records?.shared &&
          records.total !== null &&
          (records.total > records.page_size || page > 1) && (
            <div className="mt-5 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </Button>
              <span className="text-xs text-[#879BA6]">
                {page} /{" "}
                {Math.max(1, Math.ceil(records.total / records.page_size))}
              </span>
              <Button
                variant="secondary"
                disabled={page * records.page_size >= records.total}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          )}
      </Card>
    </>
  );
}
