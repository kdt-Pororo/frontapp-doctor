"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  EmptyState,
  inputClass,
  LinkButton,
  PageHeader,
} from "@/components/doctor/DoctorUI";
import { doctorDate, weekLabel } from "@/lib/doctor";

export default function PatientList() {
  const { state, loading, loadError } = useDoctor();
  const [filter, setFilter] = useState<"active" | "ended">("active");
  const [query, setQuery] = useState("");
  const patients = state.patients.filter(
    (patient) =>
      patient.status === filter &&
      `${patient.name} ${patient.babyName} ${patient.id}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="담당 산모"
        description="수락한 임신을 기준으로 현재 관리와 과거 관리 이력을 구분합니다."
        action={
          <LinkButton href="/patients/connect">연결 요청 확인</LinkButton>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-[#E1E8EC] bg-white">
        <div className="flex gap-7 border-b border-[#E8EEF1] px-6 pt-6">
          {(
            [
              { key: "active", label: "관리 중" },
              { key: "ended", label: "관리 종료" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              aria-pressed={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              className={`border-b-2 pb-5 text-sm font-semibold ${filter === tab.key ? "border-[#168B86] text-[#168B86]" : "border-transparent text-[#95A4AD]"}`}
            >
              {tab.label}
              <span className="ml-2 rounded-md bg-[#F1F5F6] px-2 py-1 text-xs">
                {loading || loadError
                  ? "—"
                  : state.patients.filter(
                      (patient) => patient.status === tab.key,
                    ).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative m-6 max-w-md">
          <Search
            size={17}
            className="absolute top-3.5 left-3.5 text-[#A4B4BD]"
          />
          <input
            aria-label="산모 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름, 태명 또는 임신 ID 검색"
            className={`${inputClass} pl-10`}
          />
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-y border-[#EDF1F3] bg-[#FAFBFC] text-xs text-[#8297A2]">
            <tr>
              {["산모", "임신 주수", "출산 예정일", "상태", "상세"].map(
                (label) => (
                  <th key={label} className="px-6 py-4 font-medium">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF1F3]">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-6 py-6">
                  <p className="font-semibold">{patient.name}</p>
                  <p className="mt-2 text-xs text-[#8297A2]">
                    임신 ID {patient.id}
                    {patient.babyName && ` · ${patient.babyName}`}
                  </p>
                </td>
                <td className="px-6">{weekLabel(patient)}</td>
                <td className="px-6">{doctorDate(patient.dueDate)}</td>
                <td className="px-6">
                  <Badge tone={filter === "ended" ? "neutral" : "teal"}>
                    {filter === "ended" ? "관리 종료" : "관리 중"}
                  </Badge>
                </td>
                <td className="px-6">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-[#168B86]"
                  >
                    상세 보기 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <p role="status" className="p-12 text-center text-sm text-[#8297A2]">
            담당 목록을 불러오고 있습니다.
          </p>
        ) : (
          !loadError &&
          patients.length === 0 && (
            <EmptyState
              title={
                query ? "검색 결과가 없습니다" : "해당 상태의 산모가 없습니다"
              }
              description="수락한 임신만 담당 목록에 표시됩니다."
            />
          )
        )}
      </section>
    </>
  );
}
