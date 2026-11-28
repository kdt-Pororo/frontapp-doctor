"use client";

import { useState } from "react";
import { ArrowDownRight, FlaskConical, Info } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  inputClass,
} from "@/components/doctor/DoctorUI";
import {
  PatientNavigation,
  PatientUnavailable,
} from "@/components/doctor/PatientNavigation";
import { doctorDate, findDoctorPatient } from "@/lib/doctor";

export default function RiskTrends({ pregnancyId }: { pregnancyId: string }) {
  const { state, notify } = useDoctor();
  const [kind, setKind] = useState<"maternal" | "preterm">("maternal");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState("all");
  const patient = findDoctorPatient(state, pregnancyId);
  if (!patient || patient.connection !== "approved")
    return <PatientUnavailable />;
  const all = state.observations
    .filter((o) => o.patientId === patient.id)
    .toSorted((a, b) => a.date.localeCompare(b.date));
  const observations = period === "recent" ? all.slice(-3) : all;
  const latest = observations.at(-1);
  const selected =
    observations.find((o) => o.recordId === selectedId) ?? latest;
  const record = state.records.find((r) => r.id === selected?.recordId);
  const pending = state.records.filter(
    (r) =>
      r.patientId === patient.id && r.predictionStatus === "not-configured",
  ).length;
  const first = observations[0];
  const difference = latest && first ? latest[kind] - first[kind] : 0;
  // 날짜를 실제 간격으로 배치합니다. 점수는 모델 성능과 무관한 가상 화면 데이터입니다.
  const firstTime = first ? new Date(first.date).getTime() : 0;
  const lastTime = latest ? new Date(latest.date).getTime() : firstTime;
  const points = observations.map((o) => ({
    ...o,
    x:
      observations.length === 1
        ? 450
        : 60 +
          ((new Date(o.date).getTime() - firstTime) /
            Math.max(lastTime - firstTime, 1)) *
            780,
    y: 265 - (o[kind] / 100) * 220,
  }));
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <>
      <PatientNavigation patient={patient} />
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#DADFED] bg-[#F0F2F9] px-5 py-4 text-xs leading-6 text-[#74849D]">
        <FlaskConical size={20} className="shrink-0" />
        <p>
          <strong className="font-semibold">위험 분석 API 연결 예정</strong> ·
          검진 기록과 예측 결과를 연결한 뒤 변화 추이를 표시합니다.
        </p>
      </div>
      <div className="mb-6 flex justify-between">
        <div className="flex gap-2">
          <Button
            variant={kind === "maternal" ? "primary" : "secondary"}
            onClick={() => setKind("maternal")}
          >
            산모 건강
          </Button>
          <Button
            variant={kind === "preterm" ? "primary" : "secondary"}
            onClick={() => setKind("preterm")}
          >
            조산 위험
          </Button>
        </div>
        <label className="flex items-center gap-3 text-xs text-[#80939E]">
          조회 기간
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={`${inputClass} w-40`}
          >
            <option value="all">전체 기록</option>
            <option value="recent">최근 3회</option>
          </select>
        </label>
      </div>
      {!latest ? (
        <Card>
          <EmptyState
            title="아직 예측 결과가 없습니다"
            description="검진 기록이 저장되어도 모델 연결 전에는 위험도 점수가 생성되지 않습니다."
            action={
              <LinkButton secondary href={`/patients/${patient.id}/records`}>
                검진 기록 보기
              </LinkButton>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-5">
            <Card>
              <p className="text-xs text-[#8DA0AB]">
                최근 {kind === "maternal" ? "산모 건강" : "조산 위험"} 시연 점수
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight">
                  {latest[kind]}
                </span>
                <span className="pb-1 text-sm text-[#A7B4BA]">/ 100</span>
              </div>
              <p className="mt-3 text-xs text-[#9CAAB5]">
                {doctorDate(latest.date)} · 예시 점수
              </p>
            </Card>
            <Card>
              <p className="text-xs text-[#8DA0AB]">선택 기간 처음 대비</p>
              <div className="mt-4 flex items-center gap-2 text-3xl font-semibold text-[#438C85]">
                <ArrowDownRight size={26} />
                {difference > 0 ? "+" : ""}
                {difference}
                <span className="text-sm font-normal">점</span>
              </div>
              <p className="mt-4 text-xs text-[#9CAAB5]">
                변화량 표시 예시 · 임상 해석 없음
              </p>
            </Card>
            <Card>
              <p className="text-xs text-[#8DA0AB]">연결된 검진</p>
              <p className="mt-4 text-4xl font-semibold">
                {observations.length}
                <span className="ml-2 text-sm font-normal text-[#9CAAB5]">
                  회
                </span>
              </p>
              <p className="mt-3 text-xs text-[#9CAAB5]">
                시연 데이터 버전 {latest.version}
              </p>
            </Card>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6">
            <Card
              title="검진별 변화 추이"
              description="점을 선택하면 해당 시점의 검진 내용을 확인할 수 있습니다."
              action={<Badge tone="purple">가상 연구 사례</Badge>}
            >
              <svg
                viewBox="0 0 900 320"
                className="w-full"
                role="img"
                aria-label={`${kind === "maternal" ? "산모 건강" : "조산 위험"} 시연 점수 변화 그래프`}
              >
                <defs>
                  <linearGradient
                    id="doctor-risk-fill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#61B4A7" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#61B4A7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map((n) => (
                  <g key={n}>
                    <line
                      x1="60"
                      x2="840"
                      y1={265 - n * 2.2}
                      y2={265 - n * 2.2}
                      stroke="#E7EFF2"
                      strokeDasharray="4 5"
                    />
                    <text
                      x="35"
                      y={270 - n * 2.2}
                      textAnchor="end"
                      fill="#A3B2BC"
                      fontSize="12"
                    >
                      {n}
                    </text>
                  </g>
                ))}
                <polygon
                  pointerEvents="none"
                  points={`60,265 ${line} ${points.at(-1)?.x ?? 840},265`}
                  fill="url(#doctor-risk-fill)"
                />
                <polyline
                  pointerEvents="none"
                  points={line}
                  fill="none"
                  stroke="#279F91"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {points.map((point) => (
                  <g
                    key={point.recordId}
                    tabIndex={0}
                    role="button"
                    aria-label={`${doctorDate(point.date)} 점수 ${point[kind]}`}
                    onClick={() => setSelectedId(point.recordId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(point.recordId);
                      }
                    }}
                    className="cursor-pointer outline-none focus:opacity-60"
                  >
                    <rect
                      x={point.x - 24}
                      y="20"
                      width="48"
                      height="290"
                      fill="transparent"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="16"
                      fill="transparent"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={selected?.recordId === point.recordId ? 7 : 5}
                      fill="white"
                      stroke="#279F91"
                      strokeWidth="3"
                    />
                    <text
                      x={point.x}
                      y={point.y - 19}
                      textAnchor="middle"
                      fill="#43897F"
                      fontSize="12"
                    >
                      {point[kind]}
                    </text>
                    <text
                      x={point.x}
                      y="296"
                      textAnchor="middle"
                      fill="#91A4AF"
                      fontSize="12"
                    >
                      {point.date.slice(5).replace("-", ".")}
                    </text>
                  </g>
                ))}
              </svg>
              <p className="flex items-center gap-2 text-[11px] text-[#A0ADB6]">
                <Info size={13} />
                점수 구간에 따른 위험 등급은 아직 정의하지 않았습니다.
              </p>
            </Card>
            <Card title="선택한 시점">
              <p className="text-xs text-[#97A7B1]">
                {selected && doctorDate(selected.date)}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#298F83]">
                {selected?.[kind]}
                <span className="ml-2 text-sm font-normal text-[#9CACB5]">
                  점 · 시연
                </span>
              </p>
              <div className="my-5 h-px bg-[#E9EFF2]" />
              <p className="text-sm font-semibold">{record?.title}</p>
              <p className="mt-3 text-xs leading-6 text-[#849BA7]">
                {record?.notes}
              </p>
              <div className="mt-5">
                <LinkButton href={`/patients/${patient.id}/records`} secondary>
                  원본 검진 기록
                </LinkButton>
              </div>
            </Card>
          </div>
        </>
      )}
      {pending > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-[#E1E8EC] bg-white p-5">
          <div>
            <p className="text-sm font-semibold">
              모델 미연결 검진 {pending}건
            </p>
            <p className="mt-1 text-xs text-[#96A7B1]">
              검진 기록은 유지되며 예측값은 비어 있습니다.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              notify(
                "모델 입력 항목과 예측 API가 확정되면 재실행 기능을 연결합니다.",
                "info",
              )
            }
          >
            연결 상태 확인
          </Button>
        </div>
      )}
    </>
  );
}
