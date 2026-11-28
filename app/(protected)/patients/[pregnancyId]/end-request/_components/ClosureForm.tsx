"use client";
import { useRef, useState, type FormEvent } from "react";
import { Button, inputClass } from "@/components/doctor/DoctorUI";
import { createClosureApi } from "@/api/doctor/doctor-closure.api";
import { todayKST } from "@/lib/doctor";
import type { ClosureOutcome } from "@/types/doctor/doctor-closure.type";

export default function ClosureForm({
  pregnancyId,
  fetuses,
  done,
}: {
  pregnancyId: string;
  fetuses: { id: number; name: string }[];
  done: () => void;
}) {
  const [items, setItems] = useState(
    fetuses.map((f) => ({
      fetus_id: f.id,
      outcome: "" as ClosureOutcome | "",
      ended_on: "",
    })),
  );
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const submission = useRef<{ payload: string; key: string } | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      lock.current ||
      !confirmed ||
      items.some((i) => !i.outcome || !i.ended_on)
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    const payload = JSON.stringify({ items, note: note.trim() });
    if (submission.current?.payload !== payload)
      submission.current = { payload, key: crypto.randomUUID() };
    try {
      await createClosureApi(pregnancyId, {
        items: items.map((i) => ({
          ...i,
          outcome: i.outcome as ClosureOutcome,
        })),
        note: note.trim(),
        submission_key: submission.current!.key,
      });
      done();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "종료 요청을 보내지 못했습니다.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <fieldset disabled={busy} className="space-y-5">
        {fetuses.map((f, index) => (
          <div
            key={f.id}
            className="grid grid-cols-[1fr_1fr_1fr] items-center gap-5 rounded-xl bg-[#F5F8FA] p-5"
          >
            <div>
              <p className="font-semibold">{f.name}</p>
              <p className="mt-2 text-xs text-[#8297A2]">태아 ID {f.id}</p>
            </div>
            <label className="space-y-2 text-sm">
              <span>종료 종류 *</span>
              <select
                required
                value={items[index].outcome}
                onChange={(e) =>
                  setItems((old) =>
                    old.map((item, i) =>
                      i === index
                        ? { ...item, outcome: e.target.value as ClosureOutcome }
                        : item,
                    ),
                  )
                }
                className={inputClass}
              >
                <option value="">선택해 주세요</option>
                <option value="FULLTERM">만삭 출산</option>
                <option value="PREMATUREBIRTH">조산</option>
                <option value="ABORTION">유산</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span>종료일 *</span>
              <input
                type="date"
                required
                max={todayKST()}
                value={items[index].ended_on}
                onChange={(e) =>
                  setItems((old) =>
                    old.map((item, i) =>
                      i === index
                        ? { ...item, ended_on: e.target.value }
                        : item,
                    ),
                  )
                }
                className={inputClass}
              />
            </label>
          </div>
        ))}
        <label className="block space-y-2 text-sm">
          <span>산모에게 전달할 내용</span>
          <textarea
            rows={3}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-[#58727F]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 size-4 accent-[#168B86]"
          />
          모든 태아의 종료 내용을 확인했습니다. 산모 본인이 수락하면 이 임신
          전체가 종료됩니다.
        </label>
      </fieldset>
      {error && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          {error} 최신 상태를 다시 확인해 주세요.
        </p>
      )}
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={
            busy || !confirmed || items.some((i) => !i.outcome || !i.ended_on)
          }
        >
          {busy ? "요청 중" : "산모에게 종료 요청 보내기"}
        </Button>
      </div>
    </form>
  );
}
