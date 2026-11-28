"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { DoctorAuthError, getDoctorApplicationApi } from "@/api/auth/doctor-auth.api";
import { useRouter } from "next/navigation";
import type { DoctorPendingDTO } from "@/types/auth/doctor-auth.type";
import type { DoctorAdditionalFormValues, DoctorEvidenceDraft } from "@/types/auth/doctor-onboarding.type";

interface OnboardingContextValue {
    identity: DoctorPendingDTO;
    draft: DoctorAdditionalFormValues | null;
    setDraft: (values: DoctorAdditionalFormValues) => void;
    evidence: DoctorEvidenceDraft | null;
    setEvidence: (file: File | null) => void;
    clearDraft: () => void;
}
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// 라우트 간에는 보존하고, 새로고침·로그인 화면으로 나가면 폐기합니다.
// 면허증과 개인정보는 localStorage/sessionStorage에 저장하지 않고 최종 제출 시에만 전송합니다.
export default function DoctorOnboardingProvider({ children }: { children: ReactNode }) {
    const [identity, setIdentity] = useState<DoctorPendingDTO | null>(null);
    const [error, setError] = useState("");
    const [draft, saveDraft] = useState<DoctorAdditionalFormValues | null>(null);
    const [evidence, saveEvidence] = useState<DoctorEvidenceDraft | null>(null);
    const router = useRouter();
    const previewRef = useRef<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const checkPendingApi = async () => {
            try {
                const result = await getDoctorApplicationApi(controller.signal);
                if (controller.signal.aborted) return;
                if (!result.data) throw new DoctorAuthError(502, "소셜 인증 정보를 확인하지 못했습니다.");
                setIdentity(result.data.identity);
                const profile = result.data.profile;
                if (profile) saveDraft({doctor_name: profile.doctor_name, doctor_email: profile.doctor_email ?? "",
                    doctor_phone: profile.doctor_phone, doctor_hospital: profile.doctor_hospital,
                    hospital_id: profile.hospital_id, doctor_license_number: profile.doctor_license_number ?? "", confirmed_information: false});
            } catch (cause) {
                if (!controller.signal.aborted) {
                    if (cause instanceof DoctorAuthError && cause.status === 403) { router.replace("/verification"); return; }
                    setError(cause instanceof DoctorAuthError ? cause.message : "인증 정보를 불러오지 못했습니다.");
                }
            }
        };
        checkPendingApi();
        return () => controller.abort();
    }, [router]);

    useEffect(() => () => {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    }, []);

    function setDraft(values: DoctorAdditionalFormValues) {
        saveDraft(values);
    }
    function setEvidence(file: File | null) {
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        const previewUrl = file ? URL.createObjectURL(file) : null;
        previewRef.current = previewUrl;
        saveEvidence(file && previewUrl ? { file, previewUrl } : null);
    }

    function clearDraft() {
        saveDraft(null);
        setEvidence(null);
    }

    if (error) return <section role="alert" className="rounded-2xl border border-red-100 bg-white p-8"><h1 className="text-2xl font-bold">소셜 인증을 확인해 주세요</h1><p className="mt-4 text-sm text-red-700">{error}</p><Link href="/login" className="mt-6 inline-block rounded-xl bg-[#168B86] px-5 py-3 text-sm text-white">다시 로그인</Link></section>;
    if (!identity) return <p role="status" className="py-16 text-center text-sm text-[#879FA7]">소셜 인증 정보를 확인하고 있습니다.</p>;
    return <OnboardingContext.Provider value={{ identity, draft, setDraft, evidence, setEvidence, clearDraft }}>{children}</OnboardingContext.Provider>;
}

export function useDoctorOnboarding() {
    const value = useContext(OnboardingContext);
    if (!value) throw new Error("DoctorOnboardingProvider 안에서 사용해 주세요.");
    return value;
}
