"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getSharedRecordsApi,
  getSharedRecordApi,
} from "@/api/doctor/record-access.api";
import { getFeatureSchemaApi } from "@/api/doctor/doctor-record.api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/doctor/DoctorUI";
import { doctorDate } from "@/lib/doctor";
import { appointmentDate } from "@/lib/doctor-appointment";
import type {
  SharedRecordList,
  SharedRecordDetail,
} from "@/types/doctor/record-access.type";
import type { FeatureSchemaDTO } from "@/types/doctor/doctor-record.type";
import { DoctorAuthError } from "@/api/auth/doctor-auth.api";

function RecordDetails({
  pregnancyId,
  recordId,
  refresh,
  onDenied,
}: {
  pregnancyId: string;
  recordId: number;
  refresh: number;
  onDenied: (message: string) => void;
}) {
  const key = `${pregnancyId}:${recordId}:${refresh}`;
  const [result, setResult] = useState<{
    key: string;
    data?: SharedRecordDetail;
    schema?: FeatureSchemaDTO;
    error?: string;
  }>();
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getSharedRecordApi(pregnancyId, String(recordId), controller.signal),
      getFeatureSchemaApi(controller.signal),
    ])
      .then(([data, schema]) => {
        if (!controller.signal.aborted) setResult({ key, data, schema });
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        const message =
          cause instanceof Error
            ? cause.message
            : "기록을 조회하지 못했습니다.";
        setResult({ key, error: message });
        if (
          cause instanceof DoctorAuthError &&
          [401, 403, 404].includes(cause.status)
        )
          onDenied(message);
      });
    return () => controller.abort();
  }, [pregnancyId, recordId, key, onDenied]);
  const current = result?.key === key ? result : undefined;
  const record = current?.data?.record;
  if (!current)
    return (
      <Card>
        <p role="status" className="py-8 text-sm text-[#8297A2]">
          읽기 권한을 확인하고 있습니다.
        </p>
      </Card>
    );
  if (current.error)
    return (
      <Card>
        <p role="alert" className="text-sm text-red-700">
          {current.error}
        </p>
      </Card>
    );
  if (!record || !current.data) return null;
  const specs =
    current.schema?.version === record.feature_schema_version
      ? current.schema.features
      : [];
  return (
    <Card
      title={record.title}
      action={
        <Badge tone="neutral">v{record.record_version} · 읽기 전용</Badge>
      }
    >
      <p className="text-sm text-[#8297A2]">
        {doctorDate(record.visited_at)} · 작성 의료진 {current.data.author_name}{" "}
        · 등록 병원 {current.data.author_hospital}
      </p>
      <dl className="mt-6 grid grid-cols-3 gap-5">
        {Object.entries(record.feature_values).map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs text-[#8297A2]">
              {specs.find((spec) => spec.key === key)?.label ?? key}
            </dt>
            <dd className="mt-2 text-sm">
              {value ?? "미입력"}
              {value !== null && specs.find((spec) => spec.key === key)?.unit
                ? ` ${specs.find((spec) => spec.key === key)?.unit}`
                : ""}
            </dd>
          </div>
        ))}
      </dl>
      <h3 className="mt-7 font-semibold">검진 내용·의료진 메모</h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#6F8793]">
        {record.notes || "미입력"}
      </p>
      <h3 className="mt-6 font-semibold">검사 결과</h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#6F8793]">
        {record.test_results || "미입력"}
      </p>
      <div className="mt-7 grid grid-cols-2 gap-5">
        {record.predictions.map((run) => (
          <section key={run.risk_kind} className="rounded-xl bg-[#F4F8F9] p-4">
            <h3 className="text-sm font-semibold">
              {run.risk_kind === "MATERNAL" ? "산모 건강" : "조산 위험"}
            </h3>
            <p className="mt-3 text-sm">
              {run.status !== "SUCCEEDED"
                ? "예측 결과 없음"
                : run.output_kind === "PROBABILITY" && run.probability !== null
                  ? `${(run.probability * 100).toFixed(1)}%`
                  : run.output_kind === "RISK_INDEX" && run.score_0_100 !== null
                    ? `${run.score_0_100} / 100`
                    : "출력 정의 확인 필요"}
            </p>
            {run.model_version && (
              <p className="mt-2 text-xs text-[#8297A2]">
                모델 {run.model_version}
              </p>
            )}
          </section>
        ))}
      </div>
      {record.reviews.map((review) => (
        <div
          key={review.risk_kind}
          className="mt-5 border-t border-[#E7EDF1] pt-5"
        >
          <h3 className="text-sm font-semibold">
            {review.risk_kind === "MATERNAL" ? "산모 건강" : "조산 위험"} · 작성
            의료진 소견
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#6F8793]">
            {review.note_text || "작성된 소견 없음"}
          </p>
        </div>
      ))}
      <Link
        href={`/directory/${pregnancyId}/records/${record.id}/history`}
        className="mt-6 inline-block text-sm font-semibold text-[#168B86]"
      >
        버전별 원본·정정 이력 보기 →
      </Link>
    </Card>
  );
}

export default function SharedClinicalRecords({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const search = useSearchParams();
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState<number>();
  const [denied, setDenied] = useState("");
  const key = `${pregnancyId}:${page}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    data?: SharedRecordList;
    error?: string;
  }>();
  useEffect(() => {
    const controller = new AbortController();
    getSharedRecordsApi(pregnancyId, page, controller.signal)
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
                : "기록을 조회하지 못했습니다.",
          });
      });
    return () => controller.abort();
  }, [pregnancyId, page, key]);
  const current = result?.key === key ? result : undefined;
  const requestedId = Number(search.get("recordId"));
  const selectedIdToRead =
    selectedId ??
    (Number.isSafeInteger(requestedId) && requestedId > 0
      ? requestedId
      : current?.data?.records[0]?.id);
  return (
    <>
      <Link
        href="/directory"
        className="mb-5 inline-block text-sm text-[#8297A2]"
      >
        ← 산모 조회로
      </Link>
      <PageHeader
        title="공유 검진 기록"
        description="산모가 승인한 임신의 검진 기록입니다. 담당 관리와 분리된 읽기 전용 화면입니다."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              setDenied("");
              setRevision((v) => v + 1);
            }}
          >
            열람 권한 새로 확인
          </Button>
        }
      />
      {!current ? (
        <p role="status" className="p-12 text-center text-sm text-[#8297A2]">
          열람 승인을 확인하고 있습니다.
        </p>
      ) : current.error || denied ? (
        <Card>
          <p role="alert" className="text-sm text-red-700">
            {current.error || denied}
          </p>
          <p className="mt-4 text-sm text-[#8297A2]">
            승인·만료·철회 상태는 산모 조회에서 확인할 수 있습니다.
          </p>
        </Card>
      ) : (
        current.data && (
          <>
            <div className="mb-6 flex items-center justify-between rounded-xl bg-[#EAF6F2] p-5 text-sm">
              <span className="font-semibold">
                {current.data.mother_name} · 임신 ID {pregnancyId}
              </span>
              <span>
                열람 기한 ·{" "}
                {current.data.access.expires_at
                  ? appointmentDate(current.data.access.expires_at)
                  : "확인 필요"}
              </span>
            </div>
            {current.data.records.length === 0 ? (
              <Card>
                <EmptyState
                  title="저장된 검진 기록이 없습니다"
                  description="기록이 등록되면 허용 기간 안에서 조회할 수 있습니다."
                />
              </Card>
            ) : (
              <div className="grid grid-cols-[280px_minmax(0,1fr)] items-start gap-6">
                <nav
                  aria-label="공유 검진 선택"
                  className="overflow-hidden rounded-2xl border border-[#E0E8EC] bg-white"
                >
                  {current.data.records.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      aria-pressed={selectedIdToRead === row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={`block w-full border-b border-[#E7EDF1] p-5 text-left ${selectedIdToRead === row.id ? "bg-[#EAF6F2]" : "hover:bg-[#F6F9FA]"}`}
                    >
                      <time className="text-xs text-[#8297A2]">
                        {doctorDate(row.visited_at)} · v{row.record_version}
                      </time>
                      <span className="mt-2 block text-sm font-semibold">
                        {row.title}
                      </span>
                      <span className="mt-2 block text-xs leading-6 text-[#8297A2]">
                        {row.author_name} · {row.author_hospital}
                      </span>
                    </button>
                  ))}
                </nav>
                {selectedIdToRead && (
                  <RecordDetails
                    pregnancyId={pregnancyId}
                    recordId={selectedIdToRead}
                    refresh={revision}
                    onDenied={setDenied}
                  />
                )}
              </div>
            )}
            {(current.data.total > current.data.page_size || page > 1) && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => {
                    setPage((p) => p - 1);
                    setSelectedId(undefined);
                  }}
                >
                  이전
                </Button>
                <span className="text-sm">
                  {page} /{" "}
                  {Math.max(
                    1,
                    Math.ceil(current.data.total / current.data.page_size),
                  )}
                </span>
                <Button
                  variant="secondary"
                  disabled={page * current.data.page_size >= current.data.total}
                  onClick={() => {
                    setPage((p) => p + 1);
                    setSelectedId(undefined);
                  }}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )
      )}
    </>
  );
}
