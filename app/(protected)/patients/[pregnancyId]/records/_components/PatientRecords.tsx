"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { Badge, Card, EmptyState } from "@/components/doctor/DoctorUI";
import { findDoctorPatient, doctorDate } from "@/lib/doctor";
import usePatientRecords from "../../_components/usePatientRecords";

export default function PatientRecords({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const { records, schema, loading, error, refresh } = usePatientRecords(
    pregnancyId,
    Boolean(patient),
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const search = useSearchParams();
  if (!patient) return <PatientUnavailable />;
  const selected =
    records.find(
      (record) => record.id === (selectedId ?? Number(search.get("recordId"))),
    ) ?? records.at(-1);
  return (
    <>
      <PatientNavigation patient={patient} />
      <div className="mb-5 flex justify-between text-sm text-[#879BA6]">
        <p>
          본인이 작성한 최근 100개 검진의 최신 버전입니다. 공유 증상은 개요에서
          확인할 수 있습니다.
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={refresh}
          className="underline underline-offset-4"
        >
          새로고침
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-5 text-sm text-red-700"
        >
          {error}
        </p>
      ) : loading ? (
        <p role="status" className="p-12 text-center text-[#879BA6]">
          검진 기록을 불러오고 있습니다.
        </p>
      ) : !selected ? (
        <Card>
          <EmptyState
            title="저장된 검진 기록이 없습니다"
            description="검진 결과를 저장하면 이곳에서 원본 입력값을 확인할 수 있습니다."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-[300px_minmax(0,1fr)] items-start gap-6">
          <nav
            aria-label="검진 기록 선택"
            className="overflow-hidden rounded-2xl border border-[#E0E8EC] bg-white"
          >
            {[...records].reverse().map((record) => (
              <button
                key={record.id}
                type="button"
                aria-pressed={record.id === selected.id}
                onClick={() => setSelectedId(record.id)}
                className={`block w-full border-b border-[#E7EDF1] p-5 text-left ${record.id === selected.id ? "bg-[#EAF6F2]" : "hover:bg-[#F6F9FA]"}`}
              >
                <time className="text-xs text-[#879BA6]">
                  {doctorDate(record.visited_at)} · #{record.id}
                </time>
                <span className="mt-2 block font-semibold text-[#496976]">
                  {record.title}
                </span>
                <span className="mt-2 block text-xs text-[#8297A2]">
                  v{record.record_version}
                  {record.record_version > 1 && " · 정정됨"}
                </span>
              </button>
            ))}
          </nav>
          <Card
            title={selected.title}
            description={doctorDate(selected.visited_at)}
            action={
              <div className="flex gap-4">
                <Link
                  href={`/patients/${pregnancyId}/risks?recordId=${selected.id}`}
                  className="text-sm text-[#168B86]"
                >
                  입력값·위험 분석 보기
                </Link>
                <Link
                  href={`/patients/${pregnancyId}/records/${selected.id}/history`}
                  className="text-sm text-[#168B86]"
                >
                  정정 이력
                </Link>
                {patient.status === "active" && (
                  <Link
                    href={`/patients/${pregnancyId}/records/${selected.id}/edit`}
                    className="text-sm font-semibold text-[#168B86]"
                  >
                    기록 정정
                  </Link>
                )}
              </div>
            }
          >
            <div className="mb-5">
              <Badge tone={selected.record_version > 1 ? "amber" : "neutral"}>
                현재 v{selected.record_version}
                {selected.record_version > 1 &&
                  ` · 정정 ${selected.record_version - 1}회`}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
              {schema?.features
                .filter((feature) => feature.enabled)
                .map((feature) => (
                  <div key={feature.key}>
                    <dt className="text-xs text-[#879BA6]">{feature.label}</dt>
                    <dd className="mt-2 text-sm text-[#496976]">
                      {selected.feature_values[feature.key] ?? "미입력"}
                      {selected.feature_values[feature.key] != null &&
                        ` ${feature.unit}`}
                    </dd>
                  </div>
                ))}
            </dl>
            <h3 className="mt-8 border-t border-[#E7EDF1] pt-6 font-semibold">
              검진 내용·의료진 메모
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6F8793]">
              {selected.notes || "미입력"}
            </p>
            <h3 className="mt-6 font-semibold">검사 결과</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6F8793]">
              {selected.test_results || "미입력"}
            </p>
            <p className="mt-7 rounded-xl bg-[#F2F7F8] p-4 text-xs text-[#6F8793]">
              각 버전의 원본은 정정 이력에서 확인할 수 있습니다. 예측 모델은
              아직 연결되지 않았습니다.
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
