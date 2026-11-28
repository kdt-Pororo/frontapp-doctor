"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { Button, EmptyState } from "@/components/doctor/DoctorUI";
import { findDoctorPatient, doctorDate } from "@/lib/doctor";
import type { RiskKind } from "@/types/doctor/doctor-record.type";
import usePatientRecords from "../../_components/usePatientRecords";
import RiskGraph, { predictionValue } from "./RiskGraph";
import RiskFeatureTable from "./RiskFeatureTable";
import RiskReviewPanel from "./RiskReviewPanel";

export default function RiskTrends({ pregnancyId }: { pregnancyId: string }) {
  const { state, notify } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const { records, schema, loading, error, refresh } = usePatientRecords(
    pregnancyId,
    Boolean(patient),
  );
  const [kind, setKind] = useState<RiskKind>("MATERNAL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const search = useSearchParams();
  if (!patient) return <PatientUnavailable />;
  const selected =
    records.find(
      (record) => record.id === (selectedId ?? Number(search.get("recordId"))),
    ) ?? records.at(-1);
  const index = selected
    ? records.findIndex((record) => record.id === selected.id)
    : -1;
  const previous = index > 0 ? records[index - 1] : undefined;
  const prediction = selected?.predictions.find(
    (run) => run.risk_kind === kind,
  );
  const value = predictionValue(prediction);
  const review = selected?.reviews.find((note) => note.risk_kind === kind) ?? {
    risk_kind: kind,
    note_text: "",
    checked_items: [],
    version: 0,
    record_version: selected?.record_version ?? 1,
    updated_at: null,
  };
  return (
    <>
      <PatientNavigation patient={patient} />
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-3">
          <Button
            variant={kind === "MATERNAL" ? "primary" : "secondary"}
            onClick={() => setKind("MATERNAL")}
          >
            산모 건강
          </Button>
          <Button
            variant={kind === "PRETERM" ? "primary" : "secondary"}
            onClick={() => setKind("PRETERM")}
          >
            조산 위험
          </Button>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="text-sm text-[#6F8793] underline underline-offset-4"
        >
          검진 새로고침
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
        <p role="status" className="py-12 text-center text-[#879BA6]">
          검진별 입력값을 불러오고 있습니다.
        </p>
      ) : (
        <>
          <RiskGraph
            records={records}
            kind={kind}
            selectedId={selected?.id}
            onSelect={setSelectedId}
          />
          {selected && schema ? (
            <div className="mt-6 grid grid-cols-[minmax(200px,0.8fr)_minmax(0,1.65fr)_minmax(280px,1fr)] items-start gap-5">
              <section className="rounded-2xl border border-[#E0E8EC] bg-white p-6">
                <h2 className="font-semibold text-[#294451]">
                  선택한 검진 결과
                </h2>
                <p className="mt-4 text-xs text-[#879BA6]">
                  {doctorDate(selected.visited_at)}
                </p>
                <p className="mt-2 text-sm text-[#58727F]">{selected.title}</p>
                <p className="mt-7 text-4xl font-semibold text-[#168B86]">
                  {value == null ? "—" : value.toFixed(1)}
                  {value != null && (
                    <span className="ml-2 text-sm font-normal">
                      {prediction?.output_kind === "PROBABILITY"
                        ? "%"
                        : "/ 100"}
                    </span>
                  )}
                </p>
                <p className="mt-3 text-sm text-[#879BA6]">
                  {value == null
                    ? "모델 미연결 · 결과 없음"
                    : prediction?.output_kind === "PROBABILITY"
                      ? "예측 확률"
                      : "위험지수"}
                </p>
                <dl className="mt-6 space-y-4 border-t border-[#E7EDF1] pt-5 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#879BA6]">이전 검진</dt>
                    <dd>
                      {previous ? doctorDate(previous.visited_at) : "없음"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#879BA6]">검진 번호</dt>
                    <dd>
                      #{selected.id} · v{selected.record_version}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/patients/${pregnancyId}/records?recordId=${selected.id}`}
                  className="mt-6 inline-block text-sm text-[#168B86] underline underline-offset-4"
                >
                  원본 검진 기록 보기
                </Link>
              </section>
              <RiskFeatureTable
                features={schema.features.filter((feature) =>
                  feature.groups.includes(kind),
                )}
                current={selected}
                previous={previous}
                prediction={prediction}
              />
              <RiskReviewPanel
                key={`${selected.id}-${selected.record_version}-${kind}-${review.version}`}
                pregnancyId={pregnancyId}
                recordId={selected.id}
                kind={kind}
                initial={review}
                readonly={patient.status === "ended"}
                onSaved={() => {
                  notify("검토 내용을 저장했습니다.");
                  refresh();
                }}
              />
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[#E0E8EC] bg-white">
              <EmptyState
                title="비교할 검진 기록이 없습니다"
                description="검진을 저장하면 날짜별 입력값과 이전 검진 대비 변화를 확인할 수 있습니다."
              />
            </div>
          )}
          <p className="mt-5 text-xs text-[#92A3AD]">
            본인이 작성한 최근 100개 검진을 표시합니다. 모델과 출력 정의가
            확정되면 실제 예측·기여도를 연결합니다.
          </p>
        </>
      )}
    </>
  );
}
