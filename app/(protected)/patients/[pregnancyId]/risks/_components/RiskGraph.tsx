import type {
  DoctorRecordDTO,
  RiskKind,
  RiskPredictionDTO,
} from "@/types/doctor/doctor-record.type";

export function predictionValue(prediction?: RiskPredictionDTO) {
  if (prediction?.status !== "SUCCEEDED") return null;
  const value =
    prediction.output_kind === "PROBABILITY"
      ? prediction.probability == null
        ? null
        : prediction.probability * 100
      : prediction.output_kind === "RISK_INDEX"
        ? prediction.score_0_100
        : null;
  return value != null && Number.isFinite(value) ? value : null;
}

export default function RiskGraph({
  records,
  kind,
  selectedId,
  onSelect,
}: {
  records: DoctorRecordDTO[];
  kind: RiskKind;
  selectedId?: number;
  onSelect: (id: number) => void;
}) {
  const latest = [...records]
    .reverse()
    .map((record) => record.predictions.find((run) => run.risk_kind === kind))
    .find((run) => predictionValue(run) !== null);
  // 입력·출력 정의와 모델 버전이 다른 결과는 같은 선으로 연결하지 않습니다.
  const points = records
    .map((record, index) => ({
      record,
      index,
      run: record.predictions.find((run) => run.risk_kind === kind),
    }))
    .filter(
      (point) =>
        predictionValue(point.run) !== null &&
        point.run?.model_version === latest?.model_version &&
        point.run?.feature_schema_version === latest?.feature_schema_version &&
        point.run?.output_kind === latest?.output_kind &&
        point.run?.output_definition === latest?.output_definition,
    )
    .map((point) => ({
      ...point,
      x: 60 + (point.index / Math.max(records.length - 1, 1)) * 980,
      y: 170 - (predictionValue(point.run)! / 100) * 140,
    }));
  return (
    <section className="rounded-2xl border border-[#E0E8EC] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#294451]">
          {kind === "MATERNAL" ? "산모 건강" : "조산 위험"} 예측 추이
        </h2>
        <span className="text-xs text-[#8297A2]">
          {latest?.model_version
            ? `모델 ${latest.model_version}`
            : "모델 미연결"}
        </span>
      </div>
      {points.length === 0 ? (
        <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl bg-[#F7FAFB] text-center">
          <p className="font-medium text-[#58727F]">
            아직 예측된 결과가 없습니다
          </p>
          <p className="mt-3 text-sm text-[#879BA6]">
            모델 연결 후 검진별 결과를 표시합니다. 입력값과 변화는 아래에서
            확인할 수 있습니다.
          </p>
        </div>
      ) : (
        <svg
          viewBox="0 0 1100 210"
          role="img"
          aria-label="같은 모델 버전의 검진별 예측 추이"
          className="mt-4 w-full"
        >
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line
                x1="60"
                x2="1040"
                y1={170 - value * 1.4}
                y2={170 - value * 1.4}
                stroke="#E3ECF0"
                strokeDasharray="4 5"
              />
              <text
                x="40"
                y={175 - value * 1.4}
                textAnchor="end"
                fontSize="12"
                fill="#8297A2"
              >
                {value}
              </text>
            </g>
          ))}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#168B86"
            strokeWidth="3"
          />
          {points.map((p) => (
            <g key={p.record.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.record.id === selectedId ? 7 : 5}
                fill="white"
                stroke="#168B86"
                strokeWidth="3"
              />
              <text
                x={p.x}
                y="200"
                textAnchor="middle"
                fontSize="12"
                fill="#8297A2"
              >
                {p.record.visited_at.slice(5, 10)}
              </text>
            </g>
          ))}
        </svg>
      )}
      <div className="mt-5 border-t border-[#E8EEF1] pt-4">
        <p className="mb-3 text-xs font-medium text-[#58727F]">검진일 선택</p>
        <div className="flex flex-wrap gap-3">
          {records.length ? (
            records.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => onSelect(record.id)}
                aria-pressed={record.id === selectedId}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${record.id === selectedId ? "border-[#168B86] bg-[#E7F5F1] text-[#168B86]" : "border-[#DFE8EC] text-[#6F8793]"}`}
              >
                <span className="block font-semibold">
                  {record.visited_at.slice(0, 10).replaceAll("-", ".")}
                </span>
                <span className="mt-1 block text-xs">
                  {record.title} · #{record.id}
                </span>
              </button>
            ))
          ) : (
            <p className="py-3 text-sm text-[#879BA6]">
              저장된 검진부터 날짜를 선택할 수 있습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
