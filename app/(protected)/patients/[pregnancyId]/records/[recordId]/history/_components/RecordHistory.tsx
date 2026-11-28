"use client";
import { useEffect, useState } from "react";
import {
  getRecordHistoryApi,
  getFeatureSchemaApi,
} from "@/api/doctor/doctor-record.api";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { Badge, Button, Card, LinkButton } from "@/components/doctor/DoctorUI";
import { findDoctorPatient, doctorDate } from "@/lib/doctor";
import { appointmentDate } from "@/lib/doctor-appointment";
import { getSharedHistoryApi } from "@/api/doctor/record-access.api";
import type {
  RecordHistory as HistoryDTO,
  FeatureSchemaDTO,
  RiskPredictionDTO,
} from "@/types/doctor/doctor-record.type";

const fields: Record<string, string> = {
  title: "검진명",
  visited_at: "검진 일시",
  notes: "검진 내용·메모",
  test_results: "검사 결과",
  feature_schema_version: "입력 항목 버전",
};
const reviewLabels: Record<string, string> = {
  verify_inputs: "입력값 확인",
  review_context: "추가 확인 사항 검토",
  plan_follow_up: "추적 계획 기록",
};
function output(run: RiskPredictionDTO) {
  if (run.status !== "SUCCEEDED") return "결과 없음";
  if (run.output_kind === "PROBABILITY" && run.probability !== null)
    return `${(run.probability * 100).toFixed(1)}%`;
  if (run.output_kind === "RISK_INDEX" && run.score_0_100 !== null)
    return `${run.score_0_100} / 100`;
  return "출력 정의 확인 필요";
}

export default function RecordHistory({
  pregnancyId,
  recordId,
  sharedAccess = false,
}: {
  pregnancyId: string;
  recordId: string;
  sharedAccess?: boolean;
}) {
  const { state } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<number>();
  const key = `${sharedAccess}:${pregnancyId}:${recordId}:${page}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    data?: HistoryDTO;
    schema?: FeatureSchemaDTO;
    error?: string;
  }>();
  const enabled = sharedAccess || Boolean(patient);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    Promise.all([
      sharedAccess
        ? getSharedHistoryApi(
            pregnancyId,
            recordId,
            page,
            controller.signal,
          ).then((result) => result.history)
        : getRecordHistoryApi(pregnancyId, recordId, page, controller.signal),
      getFeatureSchemaApi(controller.signal),
    ])
      .then(([data, schema]) => {
        if (!controller.signal.aborted) setResult({ key, data, schema });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error:
              cause instanceof Error
                ? cause.message
                : "이력을 불러오지 못했습니다.",
          });
      });
    return () => controller.abort();
  }, [pregnancyId, recordId, page, key, enabled, sharedAccess]);
  const current = result?.key === key ? result : undefined;
  const data = current?.data;
  const selected =
    data?.revisions.find((row) => row.record_version === selectedVersion) ??
    data?.revisions[0];
  const snapshot = selected?.snapshot;
  const specs =
    current?.schema?.version === snapshot?.feature_schema_version
      ? current?.schema?.features
      : undefined;
  const label = (field: string) =>
    field.startsWith("feature_values.")
      ? (specs?.find((f) => f.key === field.slice(15))?.label ??
        field.slice(15))
      : (fields[field] ?? field);
  const value = (
    raw: string | number | null,
    present: boolean,
    field?: string,
  ) =>
    !present
      ? "항목 없음"
      : raw === null || raw === ""
        ? "미입력"
        : field === "visited_at" && typeof raw === "string"
          ? appointmentDate(raw)
          : String(raw);
  if (!sharedAccess && !patient) return <PatientUnavailable />;
  return (
    <>
      {!sharedAccess && patient ? (
        <PatientNavigation patient={patient} />
      ) : (
        <div className="mb-6 rounded-xl bg-[#EAF6F2] p-5 text-sm">
          공유 검진 정정 이력 · 승인된 기간 내 읽기 전용 열람
        </div>
      )}
      <div className="mb-6 flex items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold">
            검진 정정 이력 · #{recordId}
          </h2>
          <p className="mt-2 text-sm text-[#8297A2]">
            각 버전의 원본과 당시 예측·의료진 소견을 열람합니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setRevision((v) => v + 1)}>
            최신 이력 확인
          </Button>
          <LinkButton
            href={
              sharedAccess
                ? `/directory/${pregnancyId}?recordId=${recordId}`
                : `/patients/${pregnancyId}/records?recordId=${recordId}`
            }
            secondary
          >
            현재 기록 보기
          </LinkButton>
        </div>
      </div>
      {!current ? (
        <p role="status" className="p-12 text-center text-sm text-[#8297A2]">
          정정 이력을 불러오고 있습니다.
        </p>
      ) : current.error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-5 text-sm text-red-700"
        >
          {current.error}
        </p>
      ) : !selected || !snapshot ? (
        <Card>
          <p className="text-sm text-[#8297A2]">표시할 이력이 없습니다.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-[280px_minmax(0,1fr)] items-start gap-6">
            <nav
              aria-label="기록 버전 선택"
              className="overflow-hidden rounded-2xl border border-[#E0E8EC] bg-white"
            >
              {data?.revisions.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  aria-pressed={row.record_version === selected.record_version}
                  onClick={() => setSelectedVersion(row.record_version)}
                  className={`block w-full border-b border-[#E7EDF1] p-5 text-left ${row.id === selected.id ? "bg-[#EAF6F2]" : "hover:bg-[#F6F9FA]"}`}
                >
                  <span className="font-semibold">
                    v{row.record_version}{" "}
                    {row.record_version === data.current_version
                      ? "· 현재"
                      : "· 이전"}
                  </span>
                  <span className="mt-2 block text-xs text-[#8297A2]">
                    {appointmentDate(row.created_at)}
                  </span>
                  <span className="mt-3 line-clamp-2 block text-sm text-[#58727F]">
                    {row.reason}
                  </span>
                </button>
              ))}
            </nav>
            <div className="space-y-6">
              <Card
                title={`v${selected.record_version} · ${snapshot.title}`}
                action={
                  <Badge
                    tone={
                      selected.record_version === data?.current_version
                        ? "teal"
                        : "neutral"
                    }
                  >
                    {selected.record_version === data?.current_version
                      ? "현재 버전"
                      : "이전 버전 · 열람 전용"}
                  </Badge>
                }
              >
                <p className="text-sm text-[#8297A2]">
                  검진일 {doctorDate(snapshot.visited_at)} · 보관 시각{" "}
                  {appointmentDate(selected.created_at)}
                </p>
                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#F3F7F8] p-4 text-sm leading-7">
                  {selected.reason}
                </p>
                {selected.changes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-4 font-semibold">직전 버전 대비 변경</h3>
                    <table className="w-full table-fixed text-left text-sm">
                      <thead className="bg-[#F3F7F8] text-xs text-[#8297A2]">
                        <tr>
                          <th className="p-3">항목</th>
                          <th className="p-3">정정 전</th>
                          <th className="p-3">정정 후</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7EDF1]">
                        {selected.changes.map((change) => (
                          <tr key={change.field}>
                            <td className="break-words p-3">
                              {label(change.field)}
                            </td>
                            <td className="whitespace-pre-wrap break-words p-3 text-[#8297A2]">
                              {value(
                                change.before,
                                change.before_present,
                                change.field,
                              )}
                            </td>
                            <td className="whitespace-pre-wrap break-words p-3">
                              {value(
                                change.after,
                                change.after_present,
                                change.field,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <h3 className="mt-7 mb-4 font-semibold">이 버전의 저장 내용</h3>
                <dl className="grid grid-cols-3 gap-5">
                  {Object.entries(snapshot.feature_values).map(
                    ([field, raw]) => (
                      <div key={field}>
                        <dt className="break-words text-xs text-[#8297A2]">
                          {label(`feature_values.${field}`)}
                        </dt>
                        <dd className="mt-2 text-sm">
                          {value(raw, true)}
                          {raw !== null &&
                          specs?.find((f) => f.key === field)?.unit
                            ? ` ${specs.find((f) => f.key === field)?.unit}`
                            : ""}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
                {Object.keys(snapshot.feature_values).length === 0 && (
                  <p className="text-sm text-[#8297A2]">
                    저장된 측정값이 없습니다.
                  </p>
                )}
                <h3 className="mt-7 font-semibold">검진 내용·의료진 메모</h3>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#6F8793]">
                  {snapshot.notes || "미입력"}
                </p>
                <h3 className="mt-6 font-semibold">검사 결과</h3>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#6F8793]">
                  {snapshot.test_results || "미입력"}
                </p>
                <p className="mt-6 text-xs text-[#8297A2]">
                  입력 항목 버전 · {snapshot.feature_schema_version}
                </p>
                {(snapshot.fetus_id ||
                  snapshot.confirmed_due_date ||
                  snapshot.ehg) && (
                  <details className="mt-5 text-sm">
                    <summary className="cursor-pointer text-[#168B86]">
                      보존된 기존 연결·검사 정보
                    </summary>
                    <p className="mt-3 text-[#8297A2]">
                      태아 ID {snapshot.fetus_id ?? "미지정"} · 확인 예정일{" "}
                      {snapshot.confirmed_due_date
                        ? doctorDate(snapshot.confirmed_due_date)
                        : "미입력"}
                    </p>
                    {snapshot.ehg && (
                      <p className="mt-3 whitespace-pre-wrap break-words leading-7">
                        {snapshot.ehg}
                      </p>
                    )}
                  </details>
                )}
              </Card>
              <Card title="이 버전의 예측·검토 내용">
                {selected.record_version !== data?.current_version && (
                  <p className="mb-5 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-800">
                    이전 입력에 대한 이력입니다. 현재 정정된 검진의 결과로
                    사용하지 않습니다.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-5">
                  {selected.predictions.map((run) => (
                    <section
                      key={run.id ?? run.risk_kind}
                      className="rounded-xl border border-[#E0E8EC] p-4"
                    >
                      <h3 className="text-sm font-semibold">
                        {run.risk_kind === "MATERNAL"
                          ? "산모 건강"
                          : "조산 위험"}
                      </h3>
                      <p className="mt-3 text-sm">
                        {run.status === "NOT_CONFIGURED"
                          ? "모델 미연결 · 결과 없음"
                          : output(run)}
                      </p>
                      {run.model_version && (
                        <p className="mt-2 text-xs text-[#8297A2]">
                          모델 {run.model_version}
                        </p>
                      )}
                      <details className="mt-3 text-xs">
                        <summary className="cursor-pointer text-[#168B86]">
                          당시 예측 입력 보기
                        </summary>
                        <dl className="mt-3 space-y-2">
                          {Object.entries(run.input_snapshot ?? {}).map(
                            ([field, raw]) => (
                              <div
                                key={field}
                                className="flex justify-between gap-3"
                              >
                                <dt>{label(`feature_values.${field}`)}</dt>
                                <dd>{value(raw, true)}</dd>
                              </div>
                            ),
                          )}
                        </dl>
                      </details>
                    </section>
                  ))}
                </div>
                {selected.reviews.map((review) => (
                  <div
                    key={review.risk_kind}
                    className="mt-5 border-t border-[#E7EDF1] pt-5"
                  >
                    <h3 className="text-sm font-semibold">
                      {review.risk_kind === "MATERNAL"
                        ? "산모 건강"
                        : "조산 위험"}{" "}
                      · 당시 의료진 소견
                    </h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6F8793]">
                      {review.note_text || "작성된 소견 없음"}
                    </p>
                    {review.checked_items.length > 0 && (
                      <p className="mt-3 text-xs text-[#8297A2]">
                        확인 항목 ·{" "}
                        {review.checked_items
                          .map((item) => reviewLabels[item] ?? item)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </Card>
            </div>
          </div>
          {data && (data.total > data.page_size || page > 1) && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  setSelectedVersion(undefined);
                }}
              >
                이전 이력 페이지
              </Button>
              <span className="text-sm">
                {page} / {Math.max(1, Math.ceil(data.total / data.page_size))}
              </span>
              <Button
                variant="secondary"
                disabled={page * data.page_size >= data.total}
                onClick={() => {
                  setPage((p) => p + 1);
                  setSelectedVersion(undefined);
                }}
              >
                다음 이력 페이지
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
