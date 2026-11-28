"use client";

import { useRef, useState } from "react";
import { saveRiskReviewApi } from "@/api/doctor/doctor-record.api";
import type {
  RiskReviewDTO,
  ReviewItem,
  RiskKind,
} from "@/types/doctor/doctor-record.type";
import { Button, inputClass } from "@/components/doctor/DoctorUI";

const items: { key: ReviewItem; label: string; detail: string }[] = [
  {
    key: "verify_inputs",
    label: "입력값 확인",
    detail: "단위·측정 시점·누락 항목 확인",
  },
  {
    key: "review_context",
    label: "추가 확인 사항 검토",
    detail: "증상·병력 등 진료 맥락과 함께 검토",
  },
  {
    key: "plan_follow_up",
    label: "추적 계획 기록",
    detail: "다음 검진에서 확인할 항목 정리",
  },
];

export default function RiskReviewPanel({
  pregnancyId,
  recordId,
  kind,
  initial,
  readonly,
  onSaved,
}: {
  pregnancyId: string;
  recordId: number;
  kind: RiskKind;
  initial: RiskReviewDTO;
  readonly: boolean;
  onSaved: () => void;
}) {
  const [text, setText] = useState(initial.note_text);
  const [checked, setChecked] = useState(initial.checked_items);
  const [version, setVersion] = useState(initial.version);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const lock = useRef(false);
  async function save() {
    if (readonly || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const result = await saveRiskReviewApi(pregnancyId, recordId, kind, {
        expected_version: version,
        note_text: text,
        checked_items: checked,
      });
      setVersion(result.version);
      setSaved("검토 내용을 저장했습니다.");
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "검토 내용을 저장하지 못했습니다.",
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <section className="rounded-2xl border border-[#E0E8EC] bg-white p-6">
      <h2 className="font-semibold text-[#294451]">
        확인할 항목과 의료진 소견
      </h2>
      <p className="mt-3 text-xs leading-6 text-[#8297A2]">
        자동 처방이나 치료 권고가 아닙니다. 의료진이 확인한 사항과 계획을 직접
        기록합니다.
      </p>
      <fieldset disabled={readonly || busy} className="mt-5 space-y-5">
        {items.map((item) => (
          <label key={item.key} className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-[#168B86]"
              checked={checked.includes(item.key)}
              onChange={(event) => {
                setChecked((previous) =>
                  event.target.checked
                    ? [...previous, item.key]
                    : previous.filter((key) => key !== item.key),
                );
                setSaved("");
              }}
            />
            <span className="font-medium text-[#496976]">
              {item.label}
              <span className="mt-1 block text-xs font-normal leading-5 text-[#92A3AD]">
                {item.detail}
              </span>
            </span>
          </label>
        ))}
        <label className="block text-sm font-medium text-[#496976]">
          의료진 소견
          <textarea
            value={text}
            maxLength={4000}
            rows={6}
            onChange={(event) => {
              setText(event.target.value);
              setSaved("");
            }}
            className={`${inputClass} mt-3 resize-y`}
            placeholder="확인한 내용과 추적 계획을 입력해 주세요."
          />
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="mt-4 text-xs leading-6 text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="mt-4 text-xs text-[#168B86]">
          {saved}
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={readonly || busy}>
          {readonly
            ? "이전 임신 · 열람 전용"
            : busy
              ? "저장 중…"
              : "검토 내용 저장"}
        </Button>
      </div>
    </section>
  );
}
