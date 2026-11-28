"use client";

import Link from "next/link";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { Badge, Card, EmptyState } from "@/components/doctor/DoctorUI";
import {
  findDoctorPatient,
  doctorDate,
  weekLabel,
  pregnancyStatusLabel,
} from "@/lib/doctor";
import usePatientRecords from "./usePatientRecords";
import NextAppointment from "./NextAppointment";

export default function PatientOverview({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const { records, loading, error, refresh } = usePatientRecords(
    pregnancyId,
    Boolean(patient),
  );
  if (!patient) return <PatientUnavailable />;
  const latest = records.at(-1);
  return (
    <>
      <PatientNavigation patient={patient} />
      <div className="mb-6 grid grid-cols-3 gap-5">
        {[
          {
            label:
              patient.status === "ended"
                ? "종료일 기준 주수"
                : "현재 임신 주수",
            value: weekLabel(patient),
          },
          { label: "출산 예정일", value: doctorDate(patient.dueDate) },
          {
            label: "최근 검진",
            value: loading
              ? "확인 중"
              : error
                ? "조회 실패"
                : latest
                  ? doctorDate(latest.visited_at)
                  : "기록 없음",
          },
        ].map((item) => (
          <section
            key={item.label}
            className="rounded-2xl border border-[#E0E8EC] bg-white p-6"
          >
            <p className="text-xs text-[#879BA6]">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-[#35525F]">
              {item.value}
            </p>
          </section>
        ))}
      </div>
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-xl bg-red-50 p-5 text-sm text-red-700"
        >
          <span>{error}</span>
          <button type="button" onClick={refresh} className="underline">
            다시 시도
          </button>
        </div>
      )}
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] items-start gap-6">
        <div className="space-y-6">
          <Card
            title="최근 검진 기록"
            action={
              <Link
                href={`/patients/${pregnancyId}/records`}
                className="text-sm text-[#168B86]"
              >
                기록 조회
              </Link>
            }
          >
            {loading ? (
              <p role="status" className="py-8 text-sm text-[#879BA6]">
                검진 기록을 확인하고 있습니다.
              </p>
            ) : latest ? (
              <>
                <p className="text-xs text-[#879BA6]">
                  {doctorDate(latest.visited_at)} · #{latest.id}
                </p>
                <h2 className="mt-3 font-semibold">{latest.title}</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6F8793]">
                  {latest.notes || "검진 내용 미입력"}
                </p>
                <dl className="mt-5 flex flex-wrap gap-6 border-t border-[#E7EDF1] pt-5 text-sm">
                  <div>
                    <dt className="text-xs text-[#879BA6]">혈압</dt>
                    <dd className="mt-2">
                      {latest.feature_values.systolic_bp_mmhg ?? "—"}/
                      {latest.feature_values.diastolic_bp_mmhg ?? "—"} mmHg
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#879BA6]">체중</dt>
                    <dd className="mt-2">
                      {latest.feature_values.maternal_weight_kg ?? "—"} kg
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              !error && (
                <EmptyState
                  title="저장된 검진 기록이 없습니다"
                  description="새 검진 기록을 저장하면 이곳에 표시됩니다."
                />
              )
            )}
          </Card>
          <Card title="연락처">
            <div className="flex items-center justify-between border-b border-[#E7EDF1] pb-5">
              <span className="text-sm text-[#879BA6]">
                산모 · {patient.name}
              </span>
              <span className="font-medium">
                {patient.phone || "연락처 미등록"}
              </span>
            </div>
            <p className="mt-5 text-sm text-[#879BA6]">
              보호자 연락처는 연결 범위 확인 후 별도로 제공할 예정입니다.
            </p>
          </Card>
          <Card title="공유된 산모 증상">
            <EmptyState
              title="증상 기록 연결 예정"
              description="산모가 공유한 증상 기록은 후속 단계에서 연결합니다."
            />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="입력값·위험 분석">
            <p className="text-sm leading-7 text-[#6F8793]">
              검진 날짜를 선택해 측정값과 이전 검진 대비 변화를 확인하고 의료진
              검토 내용을 남깁니다.
            </p>
            <p className="mt-4 text-xs text-[#879BA6]">
              모델 미연결 · 예측값은 생성하지 않습니다.
            </p>
            <Link
              href={`/patients/${pregnancyId}/risks`}
              className="mt-6 inline-block text-sm font-semibold text-[#168B86]"
            >
              위험 분석 열기
            </Link>
          </Card>
          <NextAppointment pregnancyId={pregnancyId} />
          <Card title="연결 및 관리 상태">
            <p className="text-sm text-[#6F8793]">
              산모 요청 · 의료진 수락 완료
            </p>
            <div className="mt-4">
              <Badge tone={patient.status === "active" ? "teal" : "neutral"}>
                {pregnancyStatusLabel(patient)}
                {patient.status === "ended" && " · 열람 전용"}
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
