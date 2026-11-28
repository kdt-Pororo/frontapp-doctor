"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import { DoctorAuthError, doctorLoginUrl, getDoctorSessionApi, isDoctorAuthConfigured } from "@/api/auth/doctor-auth.api";
import type { DoctorSocialProvider } from "@/types/auth/doctor-auth.type";

const providers: { id: DoctorSocialProvider; name: string; style: string; iconWidth: number }[] = [
    { id: "kakao", name: "카카오", style: "bg-[#ffe000] text-[#191919] hover:brightness-97", iconWidth: 28 },
    { id: "naver", name: "네이버", style: "bg-[#04c40b] text-white hover:brightness-97", iconWidth: 22 },
    { id: "google", name: "구글", style: "border border-[#dcdcdc] bg-white text-[#222] hover:bg-[#fafafa]", iconWidth: 28 },
];
const errors: Record<string, string> = {
    cancelled: "소셜 로그인이 취소되었습니다. 다시 시도해 주세요.",
    account_disabled: "이용할 수 없는 의료진 계정입니다.",
    login_failed: "소셜 로그인을 완료하지 못했습니다. 다시 시도해 주세요.",
};

export default function DoctorLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = errors[searchParams.get("error") || ""];

    useEffect(() => {
        const controller = new AbortController();

        // 일반 사용자 AuthHydration처럼 로그인 상태를 확인하되 의료진 API를 사용합니다.
        const checkAuthApi = async () => {
            try {
                const result = await getDoctorSessionApi(controller.signal);
                if (!controller.signal.aborted && result.data) {
                    router.replace(result.data.doctor_verification_status ? "/dashboard" : "/verification");
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                // 미로그인은 정상적인 로그인 화면 진입입니다.
                if (error instanceof DoctorAuthError && error.status === 401) return;
                // 자동 확인에 실패해도 로그인 화면은 사용할 수 있게 둡니다.
                // 실제 소셜 로그인 실패는 콜백의 error 값으로 따로 안내합니다.
                if (process.env.NODE_ENV === "development") {
                    console.warn("의료진 로그인 상태 자동 확인 실패", error);
                }
            }
        };

        checkAuthApi();
        return () => controller.abort();
    }, [router]);

    return (
        <DoctorAuthFrame login>
            <p className="text-xs font-semibold tracking-widest text-[#50A497]">WELCOME TO NESTEP</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">의료진 로그인</h1>
            <p className="mt-4 text-sm leading-7 text-[#96A7B1]">
                소셜 계정으로 간편하게 시작하세요.
                <br />첫 방문이라면 추가 정보와 자격 확인을 진행합니다.
            </p>
            {message && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">{message}</p>}

            <div className="mt-9 space-y-3">
                {providers.map((provider) => {
                    const content = (
                        <span className="flex items-center justify-center gap-4">
                            <span className="flex size-8 items-center justify-center">
                                <Image src={`/assets/images/login/${provider.id}.png`} alt="" width={provider.iconWidth} height={provider.iconWidth} />
                            </span>
                            {provider.name}로 로그인
                        </span>
                    );
                    const className = `flex h-14 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${provider.style}`;

                    return isDoctorAuthConfigured ? (
                        <a key={provider.id} href={doctorLoginUrl(provider.id)} className={className}>{content}</a>
                    ) : (
                        <button key={provider.id} disabled className={`${className} opacity-50`}>{content}</button>
                    );
                })}
            </div>

            {!isDoctorAuthConfigured && <p role="status" className="mt-5 text-sm text-[#879FA7]">로그인 연결을 준비하고 있습니다.</p>}
            <p className="mt-7 text-xs leading-6 text-[#879FA7]">의료진 자격 확인이 완료된 계정만 산모 관리 기능을 이용할 수 있습니다.</p>
        </DoctorAuthFrame>
    );
}
