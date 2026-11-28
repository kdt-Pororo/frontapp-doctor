"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import type { DoctorPatient } from "@/types/doctor/doctor.type";
import { weekLabel } from "@/lib/doctor";
import { Badge, PageHeader, LinkButton, EmptyState } from "./DoctorUI";

export function PatientNavigation({ patient }: { patient: DoctorPatient }) {
  const pathname = usePathname();
  const base = `/patients/${patient.id}`;
  const active = pathname.includes("/appointments")
    ? "appointments"
    : pathname.includes("/risks")
      ? "risks"
      : pathname.includes("/records")
        ? "records"
        : pathname.includes("/end-request")
          ? "end-request"
          : "overview";
  return (
    <>
      <PageHeader
        backHref="/patients"
        title={`${patient.name} · 산모 상세`}
        description={`${weekLabel(patient)}  ·  태명 ${patient.babyName}  ·  ${patient.id}`}
        action={
          <>
            {patient.status === "ended" ? (
              <Badge tone="neutral">이전 임신 · 열람 전용</Badge>
            ) : (
              <LinkButton href={`${base}/records/new`}>
                <Plus size={16} />
                검진 입력
              </LinkButton>
            )}
          </>
        }
      />
      <nav
        aria-label="산모 상세 메뉴"
        className="mb-7 flex items-center gap-7 border-b border-[#DDE7EC] text-sm"
      >
        {[
          { key: "overview", label: "개요", href: base },
          { key: "records", label: "기록 조회", href: `${base}/records` },
          {
            key: "appointments",
            label: "방문 일정",
            href: `${base}/appointments`,
          },
          { key: "risks", label: "위험도 추이", href: `${base}/risks` },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active === tab.key ? "page" : undefined}
            className={`border-b-2 pb-4 pt-1 font-medium ${active === tab.key ? "border-[#168B86] text-[#168B86]" : "border-transparent text-[#90A0AA] hover:text-[#496976]"}`}
          >
            {tab.label}
          </Link>
        ))}
        <Link
          href={`${base}/end-request`}
          className="ml-auto inline-flex items-center gap-1 pb-4 text-xs text-[#9AA8AF]"
        >
          {patient.status === "ended" ? "종료 이력" : "임신 종료 요청"}
          <ArrowUpRight size={12} />
        </Link>
      </nav>
    </>
  );
}

export function PatientUnavailable() {
  return (
    <EmptyState
      title="접근 가능한 산모 연결을 확인해 주세요"
      description="연결 승인 전이거나 담당 연결이 해제된 경우 건강 기록을 열 수 없습니다."
      action={
        <LinkButton href="/patients" secondary>
          산모 목록으로
        </LinkButton>
      }
    />
  );
}
