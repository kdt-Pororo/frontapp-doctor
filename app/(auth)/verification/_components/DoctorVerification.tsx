"use client";

import { Clock3, ShieldCheck, FileWarning } from "lucide-react";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import { Badge, Button, Card, LinkButton } from "@/components/doctor/DoctorUI";

export default function DoctorVerification() {
  const { state, setVerification } = useDoctor();
  const status = state.profile.verification;
  const content = {
    pending: {
      title: "자격 확인을 기다리고 있습니다",
      description: "제출한 면허·재직 정보를 확인하는 단계입니다.",
      icon: Clock3,
      label: "확인 대기",
    },
    revision: {
      title: "제출 정보를 보완해 주세요",
      description:
        "증빙 파일에서 면허 번호를 확인할 수 없는 상황을 시연합니다.",
      icon: FileWarning,
      label: "보완 요청",
    },
    verified: {
      title: "의료진 화면을 시작할 수 있습니다",
      description: "자격 확인이 완료된 상태의 시연입니다.",
      icon: ShieldCheck,
      label: "확인 완료",
    },
  }[status];
  const Icon = content.icon;
  return (
    <DoctorAuthFrame>
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest text-[#5EAA9D]">
          VERIFICATION
        </p>
        <h1 className="mt-3 text-3xl font-bold">의료진 인증 상태</h1>
        <p className="mt-3 text-sm text-[#8FA2AD]">
          검증 완료 후 산모 연결과 진료 기록 화면을 이용합니다.
        </p>
      </div>
      <Card>
        <div className="py-8 text-center">
          <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[#E4F2EF] text-[#429E8E]">
            <Icon size={32} />
          </span>
          <div className="mt-6">
            <Badge tone={status === "revision" ? "amber" : "teal"}>
              {content.label}
            </Badge>
          </div>
          <h2 className="mt-5 text-2xl font-bold">{content.title}</h2>
          <p className="mt-4 text-sm text-[#91A3AE]">{content.description}</p>
          <div className="mx-auto my-8 max-w-md rounded-xl bg-[#F6F9FA] p-5 text-left text-sm">
            <p>
              {state.profile.name} · {state.profile.department}
            </p>
            <p className="mt-2 text-xs text-[#8FA3AE]">
              {state.profile.hospital} · {state.profile.license}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <LinkButton href="/login" secondary>
              로그인으로
            </LinkButton>
            {status === "verified" ? (
              <LinkButton href="/dashboard">대시보드로</LinkButton>
            ) : (
              <LinkButton href="/onboarding" secondary>
                정보 다시 입력
              </LinkButton>
            )}
          </div>
        </div>
      </Card>
      <details className="mt-6 rounded-xl border border-dashed border-[#D6E1E5] p-5">
        <summary className="cursor-pointer text-xs font-medium text-[#8C9FA9]">
          시연용 인증 상태 변경 · 실제 검증 처리 아님
        </summary>
        <div className="mt-4 flex gap-3">
          {(["pending", "revision", "verified"] as const).map((value) => (
            <Button
              key={value}
              variant="secondary"
              disabled={status === value}
              onClick={() => setVerification(value)}
            >
              {value === "pending"
                ? "확인 대기"
                : value === "revision"
                  ? "보완 요청"
                  : "확인 완료"}
            </Button>
          ))}
        </div>
      </details>
    </DoctorAuthFrame>
  );
}
