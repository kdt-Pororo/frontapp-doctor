"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Plus, Search } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  EmptyState,
  inputClass,
  LinkButton,
  PageHeader,
} from "@/components/doctor/DoctorUI";
import {
  doctorDate,
  latestExam,
  nextAppointment,
  weekLabel,
} from "@/lib/doctor";

export default function PatientList() {
  const { state } = useDoctor();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"active" | "pending" | "ended">(
    "active",
  );
  const groups = {
    active: state.patients.filter(
      (p) => p.connection === "approved" && p.status === "active",
    ),
    pending: state.patients.filter((p) => p.connection === "pending"),
    ended: state.patients.filter(
      (p) => p.connection === "approved" && p.status === "ended",
    ),
  };
  const patients = groups[filter].filter((p) =>
    `${p.name} ${p.babyName} ${p.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="담당 산모"
        description="연결을 승인한 산모의 임신과 기록을 관리합니다."
        action={
          <LinkButton href="/patients/connect">
            <Plus size={16} />
            산모 연결
          </LinkButton>
        }
      />
      <div className="rounded-2xl border border-[#E1E8EC] bg-white">
        <div className="flex items-center justify-between border-b border-[#E8EEF1] px-6 pt-5">
          <div className="flex gap-7">
            {(
              [
                { key: "active", label: "관리 중" },
                { key: "pending", label: "연결 대기" },
                { key: "ended", label: "관리 종료" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                aria-pressed={filter === tab.key}
                className={`flex items-center gap-2 border-b-2 pb-5 text-sm font-semibold ${filter === tab.key ? "border-[#168B86] text-[#168B86]" : "border-transparent text-[#95A4AD]"}`}
              >
                {tab.label}
                <span className="rounded-md bg-[#F1F5F6] px-1.5 py-0.5 text-[11px]">
                  {groups[tab.key].length}
                </span>
              </button>
            ))}
          </div>
          <p className="pb-5 text-xs text-[#A0ADB5]">임신 ID 기준 관리</p>
        </div>
        <div className="px-6 py-5">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-3.5 text-[#A4B4BD]"
            />
            <input
              aria-label="산모 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="이름, 태명 또는 임신 ID 검색"
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-[#EDF1F3] bg-[#FAFBFC] text-[11px] font-medium text-[#91A3AE]">
              <tr>
                {[
                  "산모",
                  "임신 주수",
                  "출산 예정일",
                  "최근 검진",
                  "다음 방문",
                  "상태",
                  "",
                ].map((title) => (
                  <th
                    key={title}
                    className="whitespace-nowrap px-6 py-4 font-medium"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F3]">
              {patients.map((patient) => {
                const pending = patient.connection === "pending";
                const next = nextAppointment(state, patient.id);
                const exam = latestExam(state, patient.id);
                return (
                  <tr key={patient.id} className="group hover:bg-[#FAFCFC]">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-full bg-[#EAF5F1] font-semibold text-[#5CA08C]">
                          {patient.name.slice(0, 1)}
                        </span>
                        <div>
                          <p className="font-semibold text-[#365461]">
                            {patient.name}
                          </p>
                          <p className="mt-1 text-xs text-[#99ABB5]">
                            {patient.id}
                            {!pending && ` · ${patient.babyName}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 text-[#6D8490]">
                      {pending ? "—" : weekLabel(patient)}
                    </td>
                    <td className="px-6 text-[#6D8490]">
                      {pending ? "—" : doctorDate(patient.dueDate)}
                    </td>
                    <td className="px-6 text-[#6D8490]">
                      {!pending && exam ? doctorDate(exam.visitedAt) : "—"}
                    </td>
                    <td className="px-6 text-[#6D8490]">
                      {!pending && next ? doctorDate(next.date) : "—"}
                    </td>
                    <td className="px-6">
                      <Badge
                        tone={
                          pending
                            ? "amber"
                            : patient.status === "ended"
                              ? "neutral"
                              : "teal"
                        }
                      >
                        {pending
                          ? "산모 승인 대기"
                          : patient.status === "ended"
                            ? "관리 종료"
                            : "연결 완료"}
                      </Badge>
                    </td>
                    <td className="px-6 text-right">
                      <Link
                        href={
                          pending
                            ? "/patients/connect"
                            : `/patients/${patient.id}`
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#55998F]"
                      >
                        {pending ? "요청 보기" : "상세 보기"}
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {patients.length === 0 && (
          <EmptyState
            title={
              query ? "검색 결과가 없습니다" : "해당 상태의 산모가 없습니다"
            }
            description={
              query
                ? "이름, 태명 또는 임신 ID를 다시 확인해 주세요."
                : "산모와 연결하면 이곳에서 기록을 관리할 수 있습니다."
            }
          />
        )}
        <div className="flex justify-between border-t border-[#EDF1F3] px-6 py-4 text-xs text-[#9BAAB3]">
          <span>{patients.length}명의 산모</span>
          <span>
            {filter === "pending"
              ? "연결 승인 전에는 건강 기록이 표시되지 않습니다."
              : "모든 정보는 프론트 화면 시연용 데이터입니다."}
          </span>
        </div>
      </div>
    </>
  );
}
