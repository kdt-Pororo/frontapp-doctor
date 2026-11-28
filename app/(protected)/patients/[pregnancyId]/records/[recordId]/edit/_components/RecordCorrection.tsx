"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getDoctorRecordApi,
  getFeatureSchemaApi,
  correctDoctorRecordApi,
} from "@/api/doctor/doctor-record.api";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  inputClass,
  LinkButton,
} from "@/components/doctor/DoctorUI";
import { findDoctorPatient, todayKST } from "@/lib/doctor";
import type {
  DoctorRecordDTO,
  FeatureSchemaDTO,
} from "@/types/doctor/doctor-record.type";

function CorrectionEditor({
  pregnancyId,
  record,
  schema,
  reload,
}: {
  pregnancyId: string;
  record: DoctorRecordDTO;
  schema: FeatureSchemaDTO;
  reload: () => void;
}) {
  const router = useRouter();
  const { notify } = useDoctor();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const lock = useRef(false);
  const request = useRef<{ payload: string; key: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !confirmed) return;
    const data = new FormData(event.currentTarget);
    // 변하지 않은 항목의 key 없음/null/0을 그대로 보존합니다.
    const features = { ...record.feature_values };
    for (const spec of schema.features.filter((spec) => spec.enabled)) {
      const raw = String(data.get(spec.key) ?? "").trim();
      if (raw !== "") features[spec.key] = Number(raw);
      else if (Object.hasOwn(features, spec.key)) features[spec.key] = null;
    }
    const values = {
      expected_record_version: record.record_version,
      visit_date: String(data.get("visit_date")),
      title: String(data.get("title")).trim(),
      notes: String(data.get("notes") ?? "").trim(),
      test_results: String(data.get("test_results") ?? "").trim(),
      feature_schema_version: record.feature_schema_version,
      features,
      correction_reason: String(data.get("correction_reason")).trim(),
    };
    const payload = JSON.stringify(values);
    if (request.current?.payload !== payload)
      request.current = { payload, key: crypto.randomUUID() };
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const saved = await correctDoctorRecordApi(
        pregnancyId,
        String(record.id),
        { ...values, submission_key: request.current!.key },
      );
      notify(
        `검진을 v${saved.record_version}로 정정했습니다. 이전 기록은 이력에서 확인할 수 있습니다.`,
      );
      router.push(`/patients/${pregnancyId}/records?recordId=${record.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "정정 기록을 저장하지 못했습니다.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      <Card
        title="검진 기록 정정"
        action={<Badge tone="neutral">현재 v{record.record_version}</Badge>}
      >
        <p className="mb-6 text-sm leading-7 text-[#6F8793]">
          같은 검진의 잘못된 입력을 정정합니다. 새로운 날짜에 시행한 검진은 새
          기록으로 등록하세요. 원본·이전 예측 입력·이전 소견은 보존됩니다.
        </p>
        <fieldset disabled={busy} className="grid grid-cols-2 gap-5">
          <label className="space-y-2 text-sm">
            <span>검진일 *</span>
            <input
              name="visit_date"
              type="date"
              required
              max={todayKST()}
              defaultValue={record.visited_at.slice(0, 10)}
              className={inputClass}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>검진명 *</span>
            <input
              name="title"
              required
              maxLength={100}
              defaultValue={record.title}
              className={inputClass}
            />
          </label>
        </fieldset>
      </Card>
      <Card
        title="측정값 정정"
        description="빈 값은 추정하지 않습니다. 0과 미입력은 구분하여 저장합니다."
      >
        <fieldset disabled={busy} className="grid grid-cols-3 gap-x-6 gap-y-5">
          {schema.features
            .filter((spec) => spec.enabled)
            .map((spec) => (
              <label key={spec.key} className="space-y-2 text-sm">
                <span>
                  {spec.label}{" "}
                  <span className="text-xs text-[#879BA6]">{spec.unit}</span>
                </span>
                <input
                  name={spec.key}
                  type="number"
                  min={spec.minimum}
                  max={spec.maximum}
                  step={spec.step}
                  defaultValue={record.feature_values[spec.key] ?? ""}
                  placeholder="미입력"
                  className={inputClass}
                />
              </label>
            ))}
        </fieldset>
        <p className="mt-5 text-xs text-[#879BA6]">
          입력 보류 항목과 태아 연결, EHG 등 이 화면에 없는 기존 필드는 변경하지
          않습니다.
        </p>
      </Card>
      <Card title="검진 내용·검사 결과">
        <fieldset disabled={busy} className="space-y-5">
          <label className="block space-y-2 text-sm">
            <span>검진 내용·의료진 메모</span>
            <textarea
              name="notes"
              rows={5}
              maxLength={10000}
              defaultValue={record.notes}
              className={inputClass}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span>검사 결과</span>
            <textarea
              name="test_results"
              rows={3}
              maxLength={10000}
              defaultValue={record.test_results}
              className={inputClass}
            />
          </label>
        </fieldset>
      </Card>
      <Card title="정정 사유">
        <label className="block space-y-2 text-sm">
          <span>어떤 내용을 왜 정정했는지 입력하세요. *</span>
          <textarea
            name="correction_reason"
            required
            maxLength={1000}
            rows={3}
            disabled={busy}
            placeholder="예: 검사 결과지 대조 후 수축기 혈압 입력 오류 정정"
            className={inputClass}
          />
        </label>
        <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#58727F]">
          <input
            type="checkbox"
            checked={confirmed}
            disabled={busy}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 size-4 accent-[#168B86]"
          />
          변경 값과 사유를 확인했습니다. 정정 후에는 새로운 버전에서 의료진
          소견을 작성합니다.
        </label>
      </Card>
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-5 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            disabled={busy}
            onClick={reload}
            className="mt-3 underline"
          >
            입력 중인 내용을 비우고 최신 검진 다시 불러오기
          </button>
        </div>
      )}
      <div className="flex justify-end gap-3">
        <LinkButton
          href={`/patients/${pregnancyId}/records?recordId=${record.id}`}
          secondary
        >
          기록으로 돌아가기
        </LinkButton>
        <Button type="submit" disabled={busy || !confirmed}>
          {busy ? "정정 저장 중" : "정정 기록 저장"}
        </Button>
      </div>
    </form>
  );
}

export default function RecordCorrection({
  pregnancyId,
  recordId,
}: {
  pregnancyId: string;
  recordId: string;
}) {
  const { state } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const [revision, setRevision] = useState(0);
  const key = `${pregnancyId}:${recordId}:${revision}`;
  const [result, setResult] = useState<{
    key: string;
    record?: DoctorRecordDTO;
    schema?: FeatureSchemaDTO;
    error?: string;
  }>();
  const enabled = Boolean(patient);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    Promise.all([
      getDoctorRecordApi(pregnancyId, recordId, controller.signal),
      getFeatureSchemaApi(controller.signal),
    ])
      .then(([record, schema]) => {
        if (!controller.signal.aborted) setResult({ key, record, schema });
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            error:
              cause instanceof Error
                ? cause.message
                : "검진을 불러오지 못했습니다.",
          });
      });
    return () => controller.abort();
  }, [pregnancyId, recordId, key, enabled]);
  const current = result?.key === key ? result : undefined;
  if (!patient) return <PatientUnavailable />;
  return (
    <>
      <PatientNavigation patient={patient} />
      {patient.status === "ended" ? (
        <Card>
          <EmptyState
            title="종료된 임신은 조회만 가능합니다"
            description="정정 이력에서 이전 기록을 확인할 수 있습니다."
            action={
              <LinkButton
                href={`/patients/${pregnancyId}/records/${recordId}/history`}
                secondary
              >
                정정 이력 보기
              </LinkButton>
            }
          />
        </Card>
      ) : !current ? (
        <p role="status" className="p-12 text-center text-sm text-[#879BA6]">
          정정할 검진을 불러오고 있습니다.
        </p>
      ) : current.error ? (
        <Card>
          <p role="alert" className="text-sm text-red-700">
            {current.error}
          </p>
          <Button variant="secondary" onClick={() => setRevision((v) => v + 1)}>
            다시 시도
          </Button>
        </Card>
      ) : (
        current.record &&
        current.schema &&
        (current.record.feature_schema_version !== current.schema.version ? (
          <Card>
            <EmptyState
              title="입력 항목 버전이 달라 정정할 수 없습니다"
              description="원본은 이력에서 확인할 수 있습니다."
            />
          </Card>
        ) : (
          <CorrectionEditor
            key={key}
            pregnancyId={pregnancyId}
            record={current.record}
            schema={current.schema}
            reload={() => setRevision((v) => v + 1)}
          />
        ))
      )}
    </>
  );
}
