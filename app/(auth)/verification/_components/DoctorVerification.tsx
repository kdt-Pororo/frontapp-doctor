"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DoctorAuthError, getDoctorSessionApi, logoutDoctorApi } from "@/api/auth/doctor-auth.api";
import type { DoctorSessionDTO } from "@/types/auth/doctor-auth.type";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import DoctorAuthGate from "@/components/doctor/DoctorAuthGate";
import DoctorVerificationIcon from "@/components/doctor/DoctorVerificationIcon";

function VerificationStatus() {
    const router = useRouter();
    const [profile, setProfile] = useState<DoctorSessionDTO | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        getDoctorSessionApi(controller.signal).then(result => {
            if (!controller.signal.aborted) { setProfile(result.data ?? null); setLoading(false); }
        }).catch(cause => {
            if (controller.signal.aborted) return;
            if (cause instanceof DoctorAuthError && [401,403].includes(cause.status)) {router.replace("/login");return;}
            setError("검토 상태를 확인하지 못했습니다. 다시 시도해 주세요.");setLoading(false);
        });
        return () => controller.abort();
    }, [attempt, router]);

    async function logout() {
        try { await logoutDoctorApi(); router.replace("/login"); }
        catch { setError("로그아웃하지 못했습니다. 다시 시도해 주세요."); }
    }
    const approved = profile?.verification_status === "APPROVED";
    const rejected = profile?.verification_status === "REJECTED";
    return <DoctorAuthFrame>
        <p className="text-xs font-semibold tracking-widest text-[#58A296]">VERIFICATION</p>
        <h1 className="mt-3 text-3xl font-bold">의료진 자격 확인</h1>
        <section className="mt-8 rounded-2xl border border-[#DFE8E9] bg-white p-10 text-center">
            <DoctorVerificationIcon approved={approved} />
            <h2 className="mt-6 text-2xl font-semibold">{approved ? "의료진 자격이 승인되었습니다" : rejected ? "제출 정보의 보완이 필요합니다" : "관리자가 면허 정보를 확인하고 있습니다"}</h2>
            <p className="mt-4 text-sm text-[#879FA7]">{approved ? "의료진 대시보드에서 산모 관리를 시작할 수 있습니다." : "승인 전에는 산모 정보와 진료 기능을 이용할 수 없습니다."}</p>
            {profile && <dl className="mx-auto mt-8 grid max-w-xl grid-cols-[120px_1fr] gap-y-5 rounded-xl bg-[#F4F7F9] p-6 text-left text-sm">
                <dt className="text-[#879FA7]">의료진</dt><dd>{profile.doctor_name}</dd>
                <dt className="text-[#879FA7]">소속 병원</dt><dd>{profile.doctor_hospital}</dd>
                <dt className="text-[#879FA7]">면허번호</dt><dd>{profile.doctor_license_number || "—"}</dd>
                <dt className="text-[#879FA7]">검토 상태</dt><dd className="font-semibold">{approved ? "승인 완료" : rejected ? "반려" : "검토 대기"}</dd>
            </dl>}
            {rejected && <div className="mx-auto mt-5 max-w-xl rounded-xl bg-amber-50 p-5 text-left text-sm leading-7 text-amber-900"><p className="font-semibold">보완 사유</p><p className="whitespace-pre-wrap">{profile?.doctor_rejection_reason}</p></div>}
            {loading && <p role="status" className="mt-5 text-sm text-[#879FA7]">검토 상태를 확인하고 있습니다.</p>}
            {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
            <div className="mt-8 flex justify-center gap-3">
                {approved ? <Link href="/dashboard" className="rounded-xl bg-[#168B86] px-5 py-3 text-sm text-white">대시보드로</Link>
                : rejected ? <Link href="/onboarding" className="rounded-xl bg-[#168B86] px-5 py-3 text-sm text-white">정보 수정·다시 제출</Link>
                : <button type="button" disabled={loading} onClick={() => {setLoading(true);setError("");setAttempt(v => v+1);}} className="rounded-xl bg-[#168B86] px-5 py-3 text-sm text-white disabled:opacity-50">검토 상태 새로고침</button>}
                <button type="button" onClick={logout} className="rounded-xl border border-[#D5E2DE] px-5 py-3 text-sm">로그아웃</button>
            </div>
        </section>
    </DoctorAuthFrame>;
}

export default function DoctorVerification() {
    return <DoctorAuthGate requireVerified={false}><VerificationStatus /></DoctorAuthGate>;
}
