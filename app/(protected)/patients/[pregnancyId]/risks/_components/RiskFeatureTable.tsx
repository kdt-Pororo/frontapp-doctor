import type {
  DoctorRecordDTO,
  FeatureSpec,
  RiskPredictionDTO,
} from "@/types/doctor/doctor-record.type";

function display(value: number | null | undefined) {
  return value == null
    ? "미입력"
    : value.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
}

export default function RiskFeatureTable({
  features,
  current,
  previous,
  prediction,
}: {
  features: FeatureSpec[];
  current: DoctorRecordDTO;
  previous?: DoctorRecordDTO;
  prediction?: RiskPredictionDTO;
}) {
  const days = previous
    ? (new Date(current.visited_at).getTime() -
        new Date(previous.visited_at).getTime()) /
      86400000
    : null;
  const weight = current.feature_values.maternal_weight_kg;
  const oldWeight = previous?.feature_values.maternal_weight_kg;
  return (
    <section className="min-w-0 rounded-2xl border border-[#E0E8EC] bg-white p-6">
      <h2 className="font-semibold text-[#294451]">입력 항목과 변화</h2>
      <p className="mt-3 text-xs leading-6 text-[#8297A2]">
        관측값의 차이입니다. 변화량 자체를 위험 원인이나 모델 기여도로 해석하지
        않습니다.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-y border-[#E7EDF1] bg-[#F6F9FA] text-[#6F8793]">
            <tr>
              {["입력 항목", "이번 검진", "이전 검진", "변화", "모델 기여"].map(
                (label) => (
                  <th
                    key={label}
                    className="px-2 py-3 font-medium whitespace-nowrap"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF2F4]">
            {features
              .filter((spec) => spec.enabled)
              .map((spec) => {
                const value = current.feature_values[spec.key];
                const before = previous?.feature_values[spec.key];
                const delta =
                  spec.enabled && value != null && before != null
                    ? Math.round((value - before) * 100) / 100
                    : null;
                const contribution =
                  prediction?.status === "SUCCEEDED"
                    ? prediction.explanation?.items?.find(
                        (item) => item.key === spec.key,
                      )
                    : null;
                return (
                  <tr key={spec.key}>
                    <td className="px-2 py-4 leading-5 text-[#496976]">
                      {spec.label}
                      <span className="block text-[11px] text-[#92A3AD]">
                        {spec.unit}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      {spec.enabled ? display(value) : "정의 미확정"}
                    </td>
                    <td className="px-2 py-4 text-[#879BA6]">
                      {previous && spec.enabled ? display(before) : "—"}
                    </td>
                    <td className="px-2 py-4 tabular-nums">
                      {delta == null ? "—" : `${delta > 0 ? "+" : ""}${delta}`}
                    </td>
                    <td className="px-2 py-4 text-[#879BA6]">
                      {contribution && Number.isFinite(contribution.value)
                        ? `${contribution.direction === "increase" ? "↑" : "↓"} ${Math.abs(contribution.value).toFixed(3)}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {features.some((feature) => !feature.enabled) && (
        <details className="mt-5 rounded-xl border border-[#E7EDF1] p-4 text-xs text-[#879BA6]">
          <summary className="cursor-pointer font-medium text-[#58727F]">
            입력 보류 항목{" "}
            {features.filter((feature) => !feature.enabled).length}개
          </summary>
          <p className="mt-3 leading-6">
            원자료 코드의 의미가 확정되기 전까지 값을 추정하거나 정상으로
            표시하지 않습니다.
          </p>
          <ul className="mt-3 space-y-2">
            {features
              .filter((feature) => !feature.enabled)
              .map((feature) => (
                <li key={feature.key}>{feature.label} · 정의 미확정</li>
              ))}
          </ul>
        </details>
      )}
      {days != null &&
        days > 0 &&
        weight != null &&
        oldWeight != null &&
        features.some((f) => f.key === "maternal_weight_kg") && (
          <p className="mt-5 rounded-xl bg-[#F3F7F9] p-4 text-xs leading-6 text-[#6F8793]">
            검진 간격 {days.toFixed(0)}일 · 주당 체중 변화{" "}
            {(((weight - oldWeight) / days) * 7).toFixed(2)} kg/주 (관측값 계산)
          </p>
        )}
      <p className="mt-4 text-xs leading-6 text-[#92A3AD]">
        기여도는 설명 가능한 모델 결과가 연결된 뒤 표시합니다. 미입력 값을 0
        또는 정상으로 채우지 않습니다.
      </p>
    </section>
  );
}
