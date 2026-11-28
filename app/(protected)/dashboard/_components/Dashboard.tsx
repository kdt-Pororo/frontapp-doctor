"use client";

import Link from "next/link";
import { ArrowRight, Link2, UsersRound } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Card,
  EmptyState,
  LinkButton,
  PageHeader,
} from "@/components/doctor/DoctorUI";

export default function Dashboard() {
  const { state, requests, loading, loadError } = useDoctor();
  const active = state.patients.filter(
    (patient) => patient.status === "active",
  );
  return (
    <>
      <PageHeader
        title={`안녕하세요, ${state.profile.name} 선생님`}
        description="담당 산모와 새로운 연결 요청을 확인하세요."
        action={
          <LinkButton href="/patients/connect">
            <Link2 size={16} />
            연결 요청 확인
          </LinkButton>
        }
      />
      <div className="mb-7 grid grid-cols-2 gap-6">
        {[
          {
            label: "관리 중인 산모",
            value: active.length,
            unit: "명",
            icon: UsersRound,
          },
          {
            label: "수락 대기 중인 요청",
            value: requests.length,
            unit: "건",
            icon: Link2,
          },
        ].map(({ label, value, unit, icon: Icon }) => (
          <section
            key={label}
            className="rounded-2xl border border-[#E1E8EC] bg-white p-7"
          >
            <div className="flex items-center justify-between text-sm text-[#8297A2]">
              {label}
              <Icon size={20} />
            </div>
            <p className="mt-6 text-4xl font-semibold">
              {loading || loadError ? "—" : value}
              <span className="ml-2 text-sm font-normal text-[#8297A2]">
                {unit}
              </span>
            </p>
          </section>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card
          title="담당 산모"
          action={
            <Link href="/patients" className="text-sm text-[#168B86]">
              전체 보기 →
            </Link>
          }
        >
          {!loading && !loadError && active.length === 0 ? (
            <EmptyState
              title="관리 중인 산모가 없습니다"
              description="산모의 연결 요청을 수락하면 목록에 표시됩니다."
            />
          ) : (
            <div className="divide-y divide-[#EDF1F3]">
              {active.slice(0, 5).map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between py-5"
                >
                  <span>
                    {patient.name}
                    <span className="ml-3 text-xs text-[#8297A2]">
                      임신 ID {patient.id}
                    </span>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </Card>
        <Card
          title="연결 요청"
          action={
            <Badge tone="amber">
              {loading || loadError ? "—" : requests.length}건
            </Badge>
          }
        >
          <p className="text-sm leading-7 text-[#8297A2]">
            산모가 병원과 의료진을 선택해 요청합니다. 수락한 임신만 현재 담당
            목록에 표시됩니다.
          </p>
          <div className="mt-6">
            <LinkButton href="/patients/connect" secondary>
              요청 확인
              <ArrowRight size={15} />
            </LinkButton>
          </div>
        </Card>
        <Card title="방문 일정">
          <EmptyState
            title="방문 일정 API 연결 예정"
            description="실제 일정 연결 후 이곳에 표시됩니다."
          />
        </Card>
        <Card title="검진 기록">
          <EmptyState
            title="검진 기록 API 연결 예정"
            description="실제 검진 기록 연결 후 이곳에 표시됩니다."
          />
        </Card>
      </div>
    </>
  );
}
