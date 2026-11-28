"use client";

import Link from "next/link";
import DoctorVerificationIcon from "@/components/doctor/DoctorVerificationIcon";
import { useDoctorOnboarding } from "./DoctorOnboardingProvider";
import DoctorOnboardingHeader from "./DoctorOnboardingHeader";
import DoctorOnboardingCancel from "./DoctorOnboardingCancel";

export default function DoctorVerificationPreview() {
    const { draft, evidence, previewReady } = useDoctorOnboarding();
    if (!draft || !evidence || !previewReady) return <section className="rounded-2xl bg-white p-8"><h1 className="text-2xl font-bold">입력 단계를 먼저 완료해 주세요</h1><Link href="/onboarding" className="mt-6 inline-block text-[#168B86] underline">기본 정보 입력으로</Link></section>;
    return <>
        <DoctorOnboardingHeader step={3} title="검증 대기 화면 미리보기" description="이미지 등록 후 표시할 화면을 확인합니다." />
        <section className="rounded-2xl border border-[#DFE8E9] bg-white p-9">
            <DoctorVerificationIcon />
            <h2 className="mt-6 text-center text-2xl font-bold">관리자가 면허 정보를 확인합니다</h2>
            <p className="mt-4 text-center text-sm leading-7 text-[#879FA7]">실제 검증 요청은 아직 제출되지 않았습니다.<br />이 버튼 이동으로 의료진 승인이 완료되거나 대시보드 권한이 생기지 않습니다.</p>
            <dl className="mx-auto mt-8 grid max-w-lg grid-cols-[110px_1fr] gap-y-4 rounded-xl bg-[#F7FAF8] p-6 text-sm"><dt className="text-[#879FA7]">의료진</dt><dd>{draft.doctor_name}</dd><dt className="text-[#879FA7]">소속 병원</dt><dd>{draft.doctor_hospital}</dd><dt className="text-[#879FA7]">면허번호</dt><dd>{draft.doctor_license_number}</dd><dt className="text-[#879FA7]">선택 파일</dt><dd className="break-all">{evidence.file.name}</dd></dl>
            <div className="mt-8 flex items-start justify-center gap-4"><Link href="/onboarding" className="inline-flex min-h-11 items-center rounded-xl border border-[#D5E2DE] px-5 py-3 text-sm text-[#617A87]">입력 정보 수정</Link><DoctorOnboardingCancel /></div>
        </section>
    </>;
}
