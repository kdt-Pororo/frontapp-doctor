"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutDoctorApi } from "@/api/auth/doctor-auth.api";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import DoctorAuthGate from "@/components/doctor/DoctorAuthGate";
import DoctorVerificationIcon from "@/components/doctor/DoctorVerificationIcon";

function VerificationStatus() {
    const { state } = useDoctor();
    const router = useRouter();
    const [error, setError] = useState("");
    const approved = state.profile.verification === "verified";
    async function logout() { try { await logoutDoctorApi(); router.replace("/login"); } catch { setError("로그아웃하지 못했습니다. 다시 시도해 주세요."); } }
    return <DoctorAuthFrame>
        <p className="text-xs font-semibold tracking-widest text-[#58A296]">VERIFICATION</p>
        <h1 className="mt-3 text-3xl font-bold">의료진 자격 확인</h1>
        <section className="mt-8 rounded-2xl border border-[#DFE8E9] bg-white p-10 text-center">
            <div className="mb-6"><DoctorVerificationIcon approved={approved} /></div>
            <h2 className="text-xl font-semibold">{approved ? "의료진 자격이 승인되었습니다." : "관리자가 자격을 확인하고 있습니다."}</h2>
            <p className="mt-4 text-sm text-[#879FA7]">{state.profile.name} · {state.profile.hospital}</p>
            <p className="mt-5 text-sm leading-7 text-[#879FA7]">{approved ? "의료진 대시보드에서 시작하세요." : "승인 전에는 산모 정보와 진료 기능을 이용할 수 없습니다."}</p>
            {approved && <Link href="/dashboard" className="mt-6 inline-block rounded-xl bg-[#168B86] px-5 py-3 text-sm text-white">대시보드로</Link>}
            <button type="button" onClick={logout} className="mt-6 ml-3 rounded-xl border border-[#D5E2DE] px-5 py-3 text-sm">로그아웃</button>
            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        </section>
    </DoctorAuthFrame>;
}

export default function DoctorVerification() {
    return <DoctorAuthGate requireVerified={false}><VerificationStatus /></DoctorAuthGate>;
}
