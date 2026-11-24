"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelDoctorPendingApi, DoctorAuthError, getDoctorPendingApi } from "@/api/auth/doctor-auth.api";
import type { DoctorPendingDTO } from "@/types/auth/doctor-auth.type";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";

export default function DoctorSocialComplete() {
    const router = useRouter();
    const [identity, setIdentity] = useState<DoctorPendingDTO | null>(null);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        const checkPendingApi = async () => {
            try {
                const result = await getDoctorPendingApi(controller.signal);
                if (controller.signal.aborted) return;
                if (!result.data) throw new DoctorAuthError(502, "소셜 인증 정보를 확인하지 못했습니다.");
                setIdentity(result.data);
            } catch (cause) {
                if (controller.signal.aborted) return;
                setError(cause instanceof DoctorAuthError ? cause.message : "인증 정보를 불러오지 못했습니다.");
            }
        };
        checkPendingApi();
        return () => controller.abort();
    }, []);
    async function cancel() {
        setCancelling(true);
        try { await cancelDoctorPendingApi(); router.replace("/login"); }
        catch { setError("취소 요청을 완료하지 못했습니다. 다시 시도해 주세요."); }
        finally { setCancelling(false); }
    }
    return <DoctorAuthFrame>
        <p className="text-xs font-semibold tracking-widest text-[#58A296]">GET STARTED</p>
        <h1 className="mt-3 text-3xl font-bold">의료진 추가 정보</h1>
        {error && <div role="alert" className="mt-7 rounded-xl bg-red-50 p-5 text-sm text-red-700"><p>{error}</p><Link href="/login" className="mt-3 inline-block underline">다시 로그인</Link></div>}
        {!identity && !error && <p role="status" className="mt-7 text-sm text-[#879FA7]">소셜 인증 정보를 확인하고 있습니다.</p>}
        {identity && <section className="mt-8 rounded-2xl border border-[#DFE8E9] bg-white p-7">
            <h2 className="text-lg font-semibold">소셜 인증을 완료했습니다.</h2>
            <dl className="mt-6 grid grid-cols-[100px_1fr] gap-y-4 text-sm"><dt className="text-[#879FA7]">로그인 계정</dt><dd>{identity.doctor_provider}</dd><dt className="text-[#879FA7]">이메일</dt><dd>{identity.doctor_email || "소셜 계정에서 제공되지 않음"}</dd></dl>
            <p className="mt-7 text-sm leading-7 text-[#879FA7]">다음 단계에서 의료진 기본 정보와 면허증 이미지를 제출합니다.<br />추가정보 제출 전에는 회원으로 등록되지 않습니다.</p>
            {/* 이번 구현 범위는 여기까지입니다. 추가정보 폼·이미지 업로드·가입 요청은 추후 연결합니다. */}
            <button type="button" onClick={cancel} disabled={cancelling} className="mt-7 rounded-xl border border-[#D5E2DE] px-5 py-3 text-sm text-[#617A87] disabled:opacity-50">{cancelling ? "취소 중" : "취소하고 로그인으로"}</button>
        </section>}
    </DoctorAuthFrame>;
}
