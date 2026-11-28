"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelDoctorPendingApi } from "@/api/auth/doctor-auth.api";
import { useDoctorOnboarding } from "./DoctorOnboardingProvider";
import { Button } from "@/components/doctor/DoctorUI";

export default function DoctorOnboardingCancel() {
    const router = useRouter();
    const { clearDraft } = useDoctorOnboarding();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    async function cancel() {
        setBusy(true);
        try { await cancelDoctorPendingApi(); clearDraft(); router.replace("/login"); }
        catch { setError("취소하지 못했습니다. 다시 시도해 주세요."); }
        finally { setBusy(false); }
    }
    return <div><Button variant="secondary" onClick={cancel} disabled={busy}>{busy ? "취소 중" : "취소하고 로그인으로"}</Button>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}
