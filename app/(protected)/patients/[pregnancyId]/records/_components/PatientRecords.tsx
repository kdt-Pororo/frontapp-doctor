"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
} from "@/components/doctor/DoctorUI";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { doctorDate, findDoctorPatient } from "@/lib/doctor";
import type { ExamRecord } from "@/types/doctor/doctor.type";

export default function PatientRecords({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state } = useDoctor();
  const [tab, setTab] = useState("exams");
  const [selected, setSelected] = useState<ExamRecord | null>(null);
  const patient = findDoctorPatient(state, pregnancyId);
  if (!patient || patient.connection !== "approved")
    return <PatientUnavailable />;
  const records = state.records
    .filter((r) => r.patientId === patient.id)
    .toSorted((a, b) => b.visitedAt.localeCompare(a.visitedAt));
  const symptoms = state.symptoms
    .filter((r) => r.patientId === patient.id)
    .toSorted((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PatientNavigation patient={patient} />
      <Card
        title="기록 보관함"
        description="검진 기록과 산모가 작성한 증상 일지를 함께 확인합니다."
      >
        <div className="mb-6 flex gap-2">
          {[
            ["exams", "병원 검진 기록"],
            ["symptoms", "산모 증상 일지"],
          ].map(([key, label]) => (
            <Button
              key={key}
              variant={tab === key ? "primary" : "secondary"}
              onClick={() => setTab(key)}
            >
              {label} · {key === "exams" ? records.length : symptoms.length}
            </Button>
          ))}
        </div>
        {tab === "exams" ? (
          records.length ? (
            <div className="divide-y divide-[#E9EFF2]">
              {records.map((record) => (
                <article
                  key={record.id}
                  className="flex items-center gap-5 py-5 first:pt-0"
                >
                  <span className="rounded-xl bg-[#EFF7F5] p-3 text-[#489D90]">
                    <FileText size={20} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-[#95A6B0]">
                      {doctorDate(record.visitedAt)}
                    </p>
                    <h3 className="mt-1 font-semibold">{record.title}</h3>
                    <p className="mt-2 max-w-xl truncate text-sm text-[#859AA5]">
                      {record.notes}
                    </p>
                  </div>
                  <Badge
                    tone={
                      record.predictionStatus === "demo" ? "purple" : "neutral"
                    }
                  >
                    {record.predictionStatus === "demo"
                      ? "예시 추이 포함"
                      : "모델 미연결"}
                  </Badge>
                  <Button
                    variant="secondary"
                    onClick={() => setSelected(record)}
                  >
                    기록 열기
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="아직 검진 기록이 없습니다" />
          )
        ) : symptoms.length ? (
          <div className="space-y-4">
            {symptoms.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-[#E5EDF0] p-5"
              >
                <p className="text-xs text-[#8EA1AC]">
                  {doctorDate(entry.date)}
                </p>
                <h3 className="mt-2 font-semibold">{entry.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#728B97]">
                  {entry.content}
                </p>
              </article>
            ))}
            <p className="text-xs text-[#90A0A9]">
              산모가 직접 작성한 기록입니다. 의료진은 내용을 수정하지 않습니다.
            </p>
          </div>
        ) : (
          <EmptyState title="작성된 증상 일지가 없습니다" />
        )}
      </Card>
      {selected && (
        <Dialog title={selected.title} onClose={() => setSelected(null)}>
          <p className="mb-6 text-sm text-[#92A3AD]">
            {doctorDate(selected.visitedAt)} · {patient.name}
          </p>
          <dl className="grid grid-cols-2 gap-4 rounded-xl bg-[#F4F8F9] p-5 text-sm">
            <div>
              <dt className="text-xs text-[#90A2AD]">혈압</dt>
              <dd className="mt-2">{selected.bloodPressure || "미입력"}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#90A2AD]">체중</dt>
              <dd className="mt-2">
                {selected.weight ? `${selected.weight} kg` : "미입력"}
              </dd>
            </div>
          </dl>
          <h3 className="mt-6 text-sm font-semibold">검진 내용</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#758D99]">
            {selected.notes}
          </p>
          <h3 className="mt-5 text-sm font-semibold">검사 결과</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#758D99]">
            {selected.results || "미입력"}
          </p>
          <p className="mt-6 rounded-xl bg-[#F3F6FA] p-4 text-xs leading-6 text-[#8296A3]">
            {selected.predictionStatus === "demo"
              ? "가상 검진과 함께 준비한 예시 점수가 있습니다. 실제 모델 결과가 아닙니다."
              : "검진은 저장되었으며, 모델이 연결되기 전까지 예측 결과는 생성되지 않습니다."}
          </p>
        </Dialog>
      )}
    </>
  );
}
