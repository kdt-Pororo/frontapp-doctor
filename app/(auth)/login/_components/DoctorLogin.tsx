"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, FlaskConical } from "lucide-react";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import { Button } from "@/components/doctor/DoctorUI";

export default function DoctorLogin() {
  const { startDemo, notify } = useDoctor();
  const router = useRouter();
  return (
    <DoctorAuthFrame login>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#50A497]">
        WELCOME TO NESTEP
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight">의료진 로그인</h2>
      <p className="mt-4 text-sm leading-7 text-[#96A7B1]">
        소셜 계정으로 간편하게 시작하세요.
        <br />첫 방문이라면 추가 정보와 자격 확인을 진행합니다.
      </p>
      <div className="mt-9 space-y-3">
        {[
          {
            name: "카카오",
            symbol: "●",
            style: "bg-[#FEE500] text-[#3A2929] hover:bg-[#F8DE00]",
          },
          {
            name: "네이버",
            symbol: "N",
            style: "bg-[#03C75A] text-white hover:bg-[#04B854]",
          },
          {
            name: "Google",
            symbol: "G",
            style:
              "border border-[#DFE6EB] bg-white text-[#526B78] hover:bg-[#F7F9FA]",
          },
        ].map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={() =>
              notify(
                `${provider.name} 로그인은 백엔드 OAuth 연결 후 사용할 수 있습니다. 아래 시연 시작으로 화면을 확인해 주세요.`,
                "info",
              )
            }
            className={`flex h-14 w-full items-center rounded-xl px-5 text-sm font-semibold ${provider.style}`}
          >
            <span className="w-8 text-lg font-bold">{provider.symbol}</span>
            <span className="flex-1 text-center">
              {provider.name}로 계속하기
            </span>
            <span className="w-8" />
          </button>
        ))}
      </div>
      <p className="mt-5 text-xs leading-6 text-[#A0AFB7]">
        현재 소셜 로그인은 연결 전입니다. 아래 버튼은 인증과 별개로 가상 화면을
        둘러보는 기능입니다.
      </p>
      <div className="my-8 h-px bg-[#E9EFF2]" />
      <div className="rounded-2xl bg-[#F3F8F8] p-5">
        <p className="flex items-center gap-2 text-xs font-semibold text-[#5D8E8A]">
          <FlaskConical size={15} />
          프론트 시연
        </p>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            startDemo();
            router.push("/dashboard");
          }}
        >
          의료진 화면 둘러보기
          <ArrowRight size={16} />
        </Button>
        <button
          type="button"
          className="mt-4 w-full text-xs font-medium text-[#879FA7] hover:text-[#168B86]"
          onClick={() => router.push("/onboarding")}
        >
          첫 방문 · 추가 정보 입력 흐름 보기
        </button>
      </div>
    </DoctorAuthFrame>
  );
}
