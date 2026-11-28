"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button, inputClass } from "@/components/doctor/DoctorUI";
import {
  createAppointmentApi,
  updateAppointmentApi,
} from "@/api/doctor/doctor-appointment.api";
import { appointmentInput } from "@/lib/doctor-appointment";
import type { DoctorAppointment } from "@/types/doctor/doctor-appointment.type";

export default function AppointmentForm({
  pregnancyId,
  appointment,
  done,
  close,
  readOnly,
  onBusy,
}: {
  pregnancyId: string;
  appointment: DoctorAppointment | null;
  done: () => void;
  close: () => void;
  readOnly: boolean;
  onBusy: (value: boolean) => void;
}) {
  const [date, setDate] = useState(
    appointment ? appointmentInput(appointment.scheduled_at) : "",
  );
  const [title, setTitle] = useState(appointment?.title ?? "");
  const [memo, setMemo] = useState(appointment?.memo ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (submitting.current || readOnly) return;
    const scheduled_at = `${date}:00+09:00`;
    if (!date || new Date(scheduled_at).getTime() <= Date.now()) {
      setError("한국 시간 기준 현재보다 이후의 방문 일시를 선택해 주세요.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    const values = { scheduled_at, title: title.trim(), memo: memo.trim() };
    const payload = JSON.stringify(values);
    if (!submission.current || submission.current.payload !== payload)
      submission.current = { payload, key: crypto.randomUUID() };
    try {
      if (appointment)
        await updateAppointmentApi(pregnancyId, appointment.id, {
          ...values,
          expected_version: appointment.version,
        });
      else
        await createAppointmentApi(pregnancyId, {
          ...values,
          submission_key: submission.current.key,
        });
      done();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "일정을 저장하지 못했습니다.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <form
      onSubmit={save}
      className="mb-6 rounded-2xl border border-[#B9DCD7] bg-[#F7FBFA] p-6"
    >
      <h2 className="mb-5 font-semibold">
        {appointment ? "방문 일정 수정" : "방문 일정 등록"}
      </h2>
      <fieldset
        disabled={busy || readOnly}
        className="grid grid-cols-2 gap-5 disabled:opacity-60"
      >
        <label className="space-y-2 text-sm">
          <span>방문 일시 · 한국 시간 *</span>
          <input
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>방문 내용 *</span>
          <input
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 정기 산전 검진"
            className={inputClass}
          />
        </label>
        <label className="col-span-2 space-y-2 text-sm">
          <span>일정 메모</span>
          <textarea
            maxLength={2000}
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className={inputClass}
          />
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error} 수정 충돌인 경우 닫은 뒤 목록을 다시 확인해 주세요.
        </p>
      )}
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" disabled={busy} onClick={close}>
          닫기
        </Button>
        <Button type="submit" disabled={busy || readOnly}>
          {busy ? "저장 중" : appointment ? "변경 내용 저장" : "일정 등록"}
        </Button>
      </div>
    </form>
  );
}
