"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  ClipboardPlus,
  FileText,
  Link2,
  Plus,
  UsersRound,
} from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Card,
  EmptyState,
  LinkButton,
  PageHeader,
} from "@/components/doctor/DoctorUI";
import { DEMO_DATE } from "@/app/_data/doctor-demo";
import { doctorDate, weekLabel } from "@/lib/doctor";

export default function Dashboard() {
  const { state } = useDoctor();
  const activePatients = state.patients.filter(
    (patient) =>
      patient.connection === "approved" && patient.status === "active",
  );
  const today = state.appointments
    .filter(
      (item) =>
        item.date === DEMO_DATE &&
        item.status === "scheduled" &&
        activePatients.some((patient) => patient.id === item.patientId),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
  const pending = state.connectionRequests.filter(
    (request) => request.status === "pending",
  );
  const endRequests = state.endRequests.filter(
    (request) => request.status === "pending",
  );
  const recent = [...state.records]
    .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))
    .filter((record) =>
      state.patients.some(
        (patient) =>
          patient.id === record.patientId && patient.connection === "approved",
      ),
    )
    .slice(0, 3);
  const stats = [
    {
      title: "관리 중인 산모",
      value: activePatients.length,
      detail: "연결 승인 완료",
      icon: UsersRound,
      color: "bg-[#E6F4F0] text-[#418F7F]",
    },
    {
      title: "오늘의 방문",
      value: today.length,
      detail: "시연 기준일 11월 22일",
      icon: CalendarDays,
      color: "bg-[#EAF0FC] text-[#7D94C8]",
    },
    {
      title: "연결 확인 대기",
      value: pending.length,
      detail: "산모 승인 대기",
      icon: Link2,
      color: "bg-[#FFF3E2] text-[#CCA15C]",
    },
    {
      title: "누적 검진 기록",
      value: state.records.length,
      detail: "시연 기록 포함",
      icon: FileText,
      color: "bg-[#F0EDFA] text-[#A090C9]",
    },
  ];

  return (
    <>
      <PageHeader
        title={`안녕하세요, ${state.profile.name} 선생님`}
        description="산모와의 연결부터 검진 이후의 기록까지, 오늘의 업무를 확인해 보세요."
        action={
          <LinkButton href="/patients/connect">
            <Plus size={16} />
            산모 연결
          </LinkButton>
        }
      />
      <div className="mb-7 grid grid-cols-4 gap-5">
        {stats.map(({ title, value, detail, icon: Icon, color }) => (
          <section
            key={title}
            className="rounded-2xl border border-[#E1E8EC] bg-white p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-medium text-[#8A9DA8]">
                {title}
              </span>
              <span className={`rounded-xl p-2.5 ${color}`}>
                <Icon size={18} />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-[32px] font-semibold leading-none tracking-tight text-[#254452]">
                {value}
              </strong>
              <span className="text-xs text-[#9BACB4]">
                {title === "관리 중인 산모" ? "명" : "건"}
              </span>
            </div>
            <p className="mt-3 text-xs text-[#9AAAB3]">{detail}</p>
          </section>
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)] gap-6">
        <Card
          title="오늘의 방문 일정"
          description="2026년 11월 22일 · 시연 기준"
          action={<Badge tone="neutral">{today.length}건</Badge>}
        >
          {today.length ? (
            <div className="divide-y divide-[#EEF2F4]">
              {today.map((item) => {
                const patient = state.patients.find(
                  (p) => p.id === item.patientId,
                )!;
                return (
                  <Link
                    key={item.id}
                    href={`/patients/${patient.id}`}
                    className="group flex items-center gap-5 py-5 first:pt-1 last:pb-1"
                  >
                    <time className="w-12 shrink-0 text-sm font-semibold text-[#486371]">
                      {item.time}
                    </time>
                    <span className="size-2 shrink-0 rounded-full bg-[#78B7AB]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#334F5D]">
                        {patient.name}
                        <span className="ml-2 font-normal text-[#7F929C]">
                          {item.title}
                        </span>
                      </p>
                      <p className="mt-1.5 text-xs text-[#9AAAB4]">
                        {weekLabel(patient)} · {patient.babyName} · {patient.id}
                      </p>
                    </div>
                    <Badge>방문 예정</Badge>
                    <ArrowRight
                      size={16}
                      className="text-[#BAC7CD] group-hover:text-[#168B86]"
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="오늘 예정된 방문이 없습니다"
              description="검진 기록에서 다음 방문 일정을 등록할 수 있습니다."
            />
          )}
        </Card>
        <Card
          title="확인할 업무"
          description="새로운 연결과 관리 요청을 확인하세요."
        >
          <Link
            href="/patients/connect"
            className="flex items-center gap-4 rounded-xl bg-[#F3F8F7] p-4"
          >
            <span className="rounded-xl bg-white p-3 text-[#639D91]">
              <Link2 size={19} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">산모 연결 요청</p>
              <p className="mt-1 text-xs text-[#8A9EA8]">
                승인 대기 {pending.length}건
              </p>
            </div>
            <ArrowRight size={15} className="text-[#94ACA5]" />
          </Link>
          <div className="mt-4 rounded-xl border border-[#EDF1F3] p-4">
            <p className="text-sm font-semibold">임신 관리 종료 요청</p>
            {endRequests.length ? (
              endRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/patients/${request.patientId}/end-request`}
                  className="mt-3 flex justify-between text-xs text-[#8296A1]"
                >
                  <span>
                    {
                      state.patients.find((p) => p.id === request.patientId)
                        ?.name
                    }{" "}
                    · 산모 확인 대기
                  </span>
                  <ArrowRight size={14} />
                </Link>
              ))
            ) : (
              <p className="mt-2 text-xs text-[#9AAAB4]">
                확인을 기다리는 요청이 없습니다.
              </p>
            )}
          </div>
          <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#9AAAB3]">
            <ArrowDownRight size={15} className="shrink-0" />
            담당 연결을 해제해도 산모의 임신 관리는 계속됩니다.
          </p>
        </Card>
        <Card
          title="최근 검진 기록"
          action={
            <Link
              href="/patients"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#8199A4]"
            >
              산모 목록
              <ArrowRight size={13} />
            </Link>
          }
        >
          <div className="divide-y divide-[#EEF2F4]">
            {recent.map((record) => (
              <Link
                key={record.id}
                href={`/patients/${record.patientId}/records`}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span className="rounded-xl bg-[#F2F6F8] p-3 text-[#8BA4B2]">
                  <FileText size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {
                      state.patients.find((p) => p.id === record.patientId)
                        ?.name
                    }{" "}
                    · {record.title}
                  </p>
                  <p className="mt-1.5 text-xs text-[#9AAAB4]">
                    {doctorDate(record.visitedAt)}
                  </p>
                </div>
                <Badge
                  tone={
                    record.predictionStatus === "demo" ? "purple" : "neutral"
                  }
                >
                  {record.predictionStatus === "demo"
                    ? "시연 예측 이력"
                    : "모델 준비 중"}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
        <Card
          title="기록으로 이어지는 진료"
          description="검진 결과와 다음 일정을 한 흐름으로 남깁니다."
        >
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-[#EAF5F1] p-4 text-[#75A595]">
              <ClipboardPlus size={27} />
            </span>
            <p className="pt-1 text-sm leading-7 text-[#8B9CA5]">
              담당 산모를 선택해
              <br />
              새로운 검진 기록을 작성해 보세요.
            </p>
          </div>
          <div className="mt-6">
            <LinkButton href="/patients" secondary>
              담당 산모 선택
              <ArrowRight size={15} />
            </LinkButton>
          </div>
        </Card>
      </div>
    </>
  );
}
