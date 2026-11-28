"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import {
  Button,
  Card,
  EmptyState,
  inputClass,
  LinkButton,
} from "@/components/doctor/DoctorUI";
import { findDoctorPatient, todayKST } from "@/lib/doctor";
import {
  createDoctorRecordApi,
  getFeatureSchemaApi,
} from "@/api/doctor/doctor-record.api";
import type {
  FeatureSchemaDTO,
  FeatureSpec,
} from "@/types/doctor/doctor-record.type";

function FeatureInput({ spec }: { spec: FeatureSpec }) {
  return (
    <div>
      <label
        htmlFor={`feature-${spec.key}`}
        className="mb-2 block text-sm font-medium text-[#58727F]"
      >
        {spec.label}
        <span className="ml-2 font-normal text-[#8A9EA9]">{spec.unit}</span>
      </label>
      <input
        id={`feature-${spec.key}`}
        name={spec.key}
        type="number"
        min={spec.minimum}
        max={spec.maximum}
        step={spec.step}
        disabled={!spec.enabled}
        placeholder={spec.enabled ? "미입력" : "정의 확정 후 입력"}
        className={inputClass}
      />
      {!spec.enabled && (
        <p className="mt-2 text-xs leading-5 text-[#879BA6]">{spec.note}</p>
      )}
    </div>
  );
}

export default function ExamForm({ pregnancyId }: { pregnancyId: string }) {
  const { state, notify } = useDoctor();
  const patient = findDoctorPatient(state, pregnancyId);
  const router = useRouter();
  const [schema, setSchema] = useState<FeatureSchemaDTO | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const lastSubmission = useRef<{ fingerprint: string; key: string } | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    getFeatureSchemaApi(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setSchema(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "입력 항목을 불러오지 못했습니다.",
          );
      });
    return () => controller.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schema || !patient || busy || lock.current) return;
    const data = new FormData(event.currentTarget);
    const features: Record<string, number | null> = {};
    for (const spec of schema.features) {
      const raw = String(data.get(spec.key) ?? "").trim();
      features[spec.key] = spec.enabled && raw !== "" ? Number(raw) : null;
    }
    const values = {
      visit_date: String(data.get("visit_date")),
      title: String(data.get("title")).trim(),
      notes: String(data.get("notes") ?? "").trim(),
      test_results: String(data.get("test_results") ?? "").trim(),
      feature_schema_version: schema.version,
      features,
    };
    const fingerprint = JSON.stringify(values);
    if (lastSubmission.current?.fingerprint !== fingerprint)
      lastSubmission.current = { fingerprint, key: crypto.randomUUID() };
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await createDoctorRecordApi(pregnancyId, {
        ...values,
        submission_key: lastSubmission.current.key,
      });
      notify("검진 기록을 저장했습니다. 예측 모델은 아직 연결되지 않았습니다.");
      router.push(`/patients/${pregnancyId}/records`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "검진을 저장하지 못했습니다.",
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }

  if (!patient) return <PatientUnavailable />;
  if (patient.status === "ended")
    return (
      <>
        <PatientNavigation patient={patient} />
        <Card>
          <EmptyState
            title="관리가 종료된 임신입니다"
            description="기록 조회만 가능하며 새 검진을 입력할 수 없습니다."
          />
        </Card>
      </>
    );
  const groups = schema
    ? [
        {
          title: "공통 측정값",
          specs: schema.features.filter(
            (f) => f.enabled && f.groups.length > 1,
          ),
        },
        {
          title: "산모 건강 입력 후보",
          specs: schema.features.filter(
            (f) =>
              f.enabled &&
              f.groups.length === 1 &&
              f.groups.includes("MATERNAL"),
          ),
        },
        {
          title: "조산 위험 입력 후보",
          specs: schema.features.filter(
            (f) =>
              f.enabled &&
              f.groups.length === 1 &&
              f.groups.includes("PRETERM"),
          ),
        },
      ]
    : [];

  return (
    <>
      <PatientNavigation patient={patient} />
      <form
        onSubmit={submit}
        className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6"
      >
        <div className="space-y-6">
          <Card
            title="새 검진 기록"
            description="검진값을 입력하고 당시의 관찰 내용을 기록합니다. 빈 항목은 미입력으로 보관합니다."
          >
            <fieldset disabled={busy} className="grid grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="visit_date"
                  className="mb-2 block text-sm font-medium"
                >
                  검진일 *
                </label>
                <input
                  id="visit_date"
                  name="visit_date"
                  type="date"
                  required
                  defaultValue={todayKST()}
                  max={todayKST()}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium"
                >
                  검진명 *
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  maxLength={100}
                  placeholder="예: 정기 산전 검진"
                  className={inputClass}
                />
              </div>
            </fieldset>
          </Card>
          {!schema && !error && (
            <p role="status" className="p-8 text-sm text-[#8297A2]">
              입력 항목을 확인하고 있습니다.
            </p>
          )}
          {groups.map((group) => (
            <Card key={group.title} title={group.title}>
              <fieldset
                disabled={busy}
                className="grid grid-cols-2 gap-x-6 gap-y-5"
              >
                {group.specs.map((spec) => (
                  <FeatureInput key={spec.key} spec={spec} />
                ))}
              </fieldset>
            </Card>
          ))}
          {schema && (
            <details className="rounded-2xl border border-[#DFE8EC] bg-white p-6">
              <summary className="cursor-pointer font-semibold text-[#58727F]">
                분류 항목 · 입력 보류
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#879BA6]">
                소변 단백과 부종의 원자료 코드 정의를 확인한 후 입력 방식을
                정합니다. 현재는 정상 또는 0으로 간주하지 않습니다.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-5">
                {schema.features
                  .filter((spec) => !spec.enabled)
                  .map((spec) => (
                    <FeatureInput key={spec.key} spec={spec} />
                  ))}
              </div>
            </details>
          )}
          <Card title="검진 내용과 의료진 메모">
            <label htmlFor="notes" className="mb-2 block text-sm font-medium">
              검진 내용·관찰 사항
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              maxLength={10000}
              disabled={busy}
              className={inputClass}
              placeholder="관찰 내용과 진료 메모를 입력해 주세요."
            />
            <label
              htmlFor="test_results"
              className="mt-5 mb-2 block text-sm font-medium"
            >
              검사 결과
            </label>
            <textarea
              id="test_results"
              name="test_results"
              rows={3}
              maxLength={10000}
              disabled={busy}
              className={inputClass}
            />
          </Card>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-5 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <LinkButton secondary href={`/patients/${pregnancyId}/records`}>
              취소
            </LinkButton>
            <Button type="submit" disabled={!schema || busy}>
              <Save size={16} />
              {busy ? "저장 중…" : "검진 기록 저장"}
            </Button>
          </div>
        </div>
        <aside className="space-y-6">
          <Card title="입력과 예측">
            <p className="text-sm leading-7 text-[#7B929E]">
              현재는 검진값과 메모를 저장합니다. 데이터와 모델이 정해지면 이
              기록을 바탕으로 예측 결과와 항목별 기여도를 연결합니다.
            </p>
            <p className="mt-5 rounded-xl bg-[#F1F6F8] p-4 text-sm text-[#58727F]">
              모델 미연결 · 점수 생성 안 함
            </p>
            <p className="mt-4 text-xs leading-6 text-[#879BA6]">
              입력 항목은 잠정 구성입니다. 측정하지 않은 값은 추정해서 채우지
              마세요.
            </p>
          </Card>
          <Card title="다음 방문 일정">
            <p className="text-sm leading-7 text-[#879BA6]">
              검진 기록과 방문 일정은 각각 저장합니다.
            </p>
            <a
              href={`/patients/${pregnancyId}/appointments`}
              className="mt-4 inline-block text-sm font-semibold text-[#168B86]"
            >
              방문 일정 관리 →
            </a>
          </Card>
        </aside>
      </form>
    </>
  );
}
