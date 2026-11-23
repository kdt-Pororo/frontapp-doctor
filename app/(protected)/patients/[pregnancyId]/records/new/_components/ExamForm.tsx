"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Save, Sparkles } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Button,
  Card,
  EmptyState,
  Field,
  inputClass,
  LinkButton,
} from "@/components/doctor/DoctorUI";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { findDoctorPatient } from "@/lib/doctor";
import { DEMO_DATE } from "@/app/_data/doctor-demo";

export default function ExamForm({ pregnancyId }: { pregnancyId: string }) {
  const { state, saveExam, notify } = useDoctor();
  const router = useRouter();
  const [schedule, setSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const patient = findDoctorPatient(state, pregnancyId);
  if (!patient || patient.connection !== "approved")
    return <PatientUnavailable />;
  if (patient.status === "ended")
    return (
      <>
        <PatientNavigation patient={patient} />
        <Card>
          <EmptyState
            title="관리가 종료된 임신입니다"
            description="기존 기록을 열람할 수 있으며 새 검진과 일정은 입력할 수 없습니다."
          />
        </Card>
      </>
    );
  const patientId = patient.id;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    if (schedule && value("nextDate") < value("visitedAt")) {
      notify("다음 방문일은 검진일 이후로 선택해 주세요.", "error");
      return;
    }
    setSaving(true);
    try {
      saveExam({
        patientId,
        visitedAt: value("visitedAt"),
        title: value("title"),
        notes: value("notes"),
        results: value("results"),
        bloodPressure: value("bloodPressure"),
        weight: value("weight"),
        nextDate: schedule ? value("nextDate") : "",
        nextTime: schedule ? value("nextTime") : "",
        nextTitle: schedule ? value("nextTitle") : "",
      });
      router.push(`/patients/${patientId}/records`);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "입력 내용을 확인해 주세요.",
        "error",
      );
      setSaving(false);
    }
  }
  return (
    <>
      <PatientNavigation patient={patient} />
      <form
        onSubmit={submit}
        className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6"
      >
        <div className="space-y-6">
          <Card
            title="새 검진 기록"
            description="검진 결과와 다음 방문 계획을 한 번에 남깁니다."
          >
            <div className="grid grid-cols-2 gap-5">
              <Field label="검진일 *">
                <input
                  type="date"
                  name="visitedAt"
                  required
                  defaultValue={DEMO_DATE}
                  className={inputClass}
                />
              </Field>
              <Field label="검진명 *">
                <input
                  name="title"
                  required
                  maxLength={100}
                  placeholder="예: 정기 산전 검진"
                  className={inputClass}
                />
              </Field>
              <Field label="혈압 (mmHg)">
                <input
                  name="bloodPressure"
                  placeholder="예: 112/72"
                  className={inputClass}
                />
              </Field>
              <Field label="체중 (kg)">
                <input
                  type="number"
                  name="weight"
                  min="20"
                  max="300"
                  step="0.1"
                  placeholder="예: 63.2"
                  className={inputClass}
                />
              </Field>
              <div className="col-span-2">
                <Field label="검진 내용 *">
                  <textarea
                    name="notes"
                    required
                    maxLength={4000}
                    rows={5}
                    placeholder="검진 내용과 관찰 사항을 기록해 주세요."
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="검사 결과">
                  <textarea
                    name="results"
                    maxLength={4000}
                    rows={4}
                    placeholder="검사 항목과 결과를 입력해 주세요."
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Card>
          <Card
            title="다음 방문 일정"
            action={<CalendarDays size={19} className="text-[#6C9D9C]" />}
          >
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={schedule}
                onChange={(e) => setSchedule(e.target.checked)}
                className="size-4 accent-[#168B86]"
              />
              다음 검진 일정도 함께 등록하기
            </label>
            {schedule && (
              <div className="mt-6 grid grid-cols-2 gap-5">
                <Field label="방문일 *">
                  <input
                    type="date"
                    name="nextDate"
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="시간 *">
                  <input
                    type="time"
                    name="nextTime"
                    required
                    className={inputClass}
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="방문 내용 *">
                    <input
                      name="nextTitle"
                      required
                      placeholder="예: 정밀 초음파 검진"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            )}
          </Card>
          <div className="flex justify-end gap-3">
            <LinkButton
              href={`/patients/${patient.id}/records`}
              secondary
            >
              취소
            </LinkButton>
            <Button type="submit" disabled={saving}>
              <Save size={16} />
              {saving ? "저장 중" : "검진 기록 저장"}
            </Button>
          </div>
        </div>
        <Card
          title="기록과 예측 연결"
          action={<Sparkles size={18} className="text-[#8E80B8]" />}
        >
          <ol className="space-y-6 text-sm">
            <li>
              <p className="font-semibold">01 · 검진 기록 저장</p>
              <p className="mt-2 text-xs leading-6 text-[#8A9EA9]">
                작성한 검진과 다음 일정이 시연 화면에 반영됩니다.
              </p>
            </li>
            <li>
              <p className="font-semibold text-[#95A3B0]">
                02 · 모델에 입력 전달
              </p>
              <p className="mt-2 text-xs leading-6 text-[#8A9EA9]">
                모델과 입력 항목이 확정되면 백엔드에서 연결할 단계입니다.
              </p>
            </li>
            <li>
              <p className="font-semibold text-[#95A3B0]">
                03 · 예측 이력 보관
              </p>
              <p className="mt-2 text-xs leading-6 text-[#8A9EA9]">
                검진 기록 ID를 기준으로 결과와 실행 시각을 보관할 예정입니다.
              </p>
            </li>
          </ol>
          <p className="mt-7 rounded-xl bg-[#F4F1FB] p-4 text-xs leading-6 text-[#8C7BA5]">
            지금은 모델 미연결 상태입니다. 임의의 예측값을 생성하지 않습니다.
          </p>
        </Card>
      </form>
    </>
  );
}
