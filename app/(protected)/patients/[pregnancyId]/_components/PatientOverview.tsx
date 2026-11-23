"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Link2,
  NotebookPen,
  TrendingUp,
} from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  LinkButton,
} from "@/components/doctor/DoctorUI";
import {
  doctorDate,
  findDoctorPatient,
  latestExam,
  nextAppointment,
  weekLabel,
} from "@/lib/doctor";

export default function PatientOverview({
  pregnancyId,
}: {
  pregnancyId: string;
}) {
  const { state, revokeCare } = useDoctor();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const patient = findDoctorPatient(state, pregnancyId);
  if (!patient || patient.connection !== "approved")
    return <PatientUnavailable />;
  const exam = latestExam(state, patient.id);
  const next = nextAppointment(state, patient.id);
  const symptoms = state.symptoms
    .filter((item) => item.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);
  const base = `/patients/${patient.id}`;
  const facts = [
    { label: "현재 임신 주수", value: weekLabel(patient), icon: Clock3 },
    {
      label: "출산 예정일",
      value: doctorDate(patient.dueDate),
      icon: CalendarDays,
    },
    {
      label: "최근 검진",
      value: exam ? doctorDate(exam.visitedAt) : "기록 없음",
      icon: FileText,
    },
  ];

  return (
    <>
      <PatientNavigation patient={patient} />
      <div className="mb-6 grid grid-cols-3 gap-5">
        {facts.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-[#E1E8EC] bg-white p-5"
          >
            <span className="rounded-xl bg-[#F1F6F7] p-3 text-[#7F9DAA]">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-xs text-[#8CA0AB]">{label}</p>
              <p className="mt-2 text-xl font-semibold text-[#35525F]">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] gap-6">
        <div className="space-y-6">
          <Card
            title="공유된 산모 증상"
            description="산모가 기록한 내용을 읽기 전용으로 확인합니다."
            action={
              <Link href={`${base}/records`} className="text-xs text-[#509C90]">
                전체 보기
              </Link>
            }
          >
            {symptoms.length ? (
              <div className="space-y-4">
                {symptoms.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl bg-[#F7FAFB] p-5"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs text-[#9CAEB7]">
                      <NotebookPen size={13} />
                      {doctorDate(item.date)}
                    </div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#7E939F]">
                      {item.content}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="아직 공유된 증상 기록이 없습니다" />
            )}
          </Card>
          <Card
            title="최근 검진 기록"
            action={
              <Link
                href={`${base}/records`}
                className="inline-flex items-center gap-1 text-xs text-[#509C90]"
              >
                기록 보기
                <ChevronRight size={13} />
              </Link>
            }
          >
            {exam ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9AAAB4]">
                    {doctorDate(exam.visitedAt)}
                  </p>
                  <Badge
                    tone={
                      exam.predictionStatus === "demo" ? "purple" : "neutral"
                    }
                  >
                    {exam.predictionStatus === "demo"
                      ? "시연 예측 이력"
                      : "모델 준비 중"}
                  </Badge>
                </div>
                <h3 className="mt-3 font-semibold">{exam.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#7F929E]">
                  {exam.notes}
                </p>
                <div className="mt-5 flex gap-6 border-t border-[#EDF1F3] pt-4 text-xs text-[#8B9EA8]">
                  <span>
                    혈압{" "}
                    <strong className="ml-2 font-medium text-[#587583]">
                      {exam.bloodPressure || "—"} mmHg
                    </strong>
                  </span>
                  <span>
                    체중{" "}
                    <strong className="ml-2 font-medium text-[#587583]">
                      {exam.weight || "—"} kg
                    </strong>
                  </span>
                </div>
              </>
            ) : (
              <EmptyState title="등록된 검진 기록이 없습니다" />
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card
            title="다음 방문 일정"
            action={<CalendarDays size={18} className="text-[#8BACB4]" />}
          >
            {next && patient.status === "active" ? (
              <>
                <p className="text-2xl font-semibold text-[#335A65]">
                  {doctorDate(next.date)}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-[#7B929E]">
                  <Clock3 size={15} />
                  {next.time} · {next.title}
                </p>
                <div className="mt-5">
                  <Badge>방문 예정</Badge>
                </div>
              </>
            ) : (
              <p className="py-5 text-sm text-[#96A7B1]">
                예정된 방문이 없습니다.
              </p>
            )}
          </Card>
          <Card title="위험도 변화 이력">
            <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#EEECF8] text-[#A28CCB]">
              <TrendingUp size={22} />
            </div>
            <p className="text-sm leading-7 text-[#8B9CA5]">
              검진일별 산모 건강·조산 모델의 결과와 입력 기록을 확인합니다.
            </p>
            <Link
              href={`${base}/risks`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#599A8F]"
            >
              추이 살펴보기
              <ArrowRight size={15} />
            </Link>
          </Card>
          <Card title="연결 및 관리 상태">
            <div className="flex items-center gap-2 text-sm text-[#6E8C97]">
              <Link2 size={15} />
              <span>산모 승인·동의 완료</span>
            </div>
            <div className="mt-4">
              <Badge tone={patient.status === "active" ? "teal" : "neutral"}>
                {patient.status === "active"
                  ? "관리 중"
                  : `관리 종료 ${doctorDate(patient.endedOn ?? "")}`}
              </Badge>
            </div>
            <div className="mt-5 border-t border-[#EDF1F3] pt-4">
              <button
                type="button"
                onClick={() => setShowDisconnect(true)}
                className="text-xs text-[#A0AEB5] underline-offset-4 hover:underline"
              >
                담당 연결 해제
              </button>
            </div>
          </Card>
        </div>
      </div>
      {showDisconnect && (
        <Dialog
          title="담당 연결을 해제할까요?"
          onClose={() => setShowDisconnect(false)}
        >
          <p className="text-sm leading-7 text-[#7F949E]">
            {patient.name} 산모의 담당 기록에 더 이상 접근하지 않습니다. 산모의
            임신 상태와 개인 기록은 유지됩니다.
          </p>
          <div className="mt-7 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDisconnect(false)}
            >
              돌아가기
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                revokeCare(patient.id);
                setShowDisconnect(false);
              }}
            >
              연결 해제
            </Button>
          </div>
        </Dialog>
      )}
      {patient.status === "active" && !exam && (
        <div className="mt-6">
          <LinkButton href={`${base}/records/new`}>
            첫 검진 기록 작성
          </LinkButton>
        </div>
      )}
    </>
  );
}
