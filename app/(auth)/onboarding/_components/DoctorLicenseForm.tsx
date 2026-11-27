"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/doctor/DoctorUI";
import { useDoctorOnboarding } from "./DoctorOnboardingProvider";
import DoctorOnboardingHeader from "./DoctorOnboardingHeader";

const maxFileSize = 5 * 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];

export default function DoctorLicenseForm() {
    const { draft, evidence, setEvidence, setPreviewReady } = useDoctorOnboarding();
    const router = useRouter();
    const fileInput = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [reading, setReading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const selectionId = useRef(0);

    useEffect(() => () => { selectionId.current += 1; }, []);

    async function selectImage(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        const currentSelection = ++selectionId.current;
        setConfirmed(false);
        setError("");
        if (!imageTypes.includes(file.type)) { setError("JPG, PNG, WEBP 이미지만 선택할 수 있습니다."); return; }
        if (file.size > maxFileSize) { setError("이미지는 5MB 이하로 선택해 주세요."); return; }
        setReading(true);
        const testUrl = URL.createObjectURL(file);
        try {
            const image = new window.Image();
            image.src = testUrl;
            await image.decode();
            if (currentSelection === selectionId.current) setEvidence(file);
        } catch {
            if (currentSelection === selectionId.current) setError("이미지를 열 수 없습니다. 다른 파일을 선택해 주세요.");
        } finally {
            URL.revokeObjectURL(testUrl);
            if (currentSelection === selectionId.current) setReading(false);
        }
    }

    function next(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!evidence || reading || error) { setError("확인 가능한 면허증 이미지를 선택해 주세요."); return; }
        if (!confirmed) { setError("실명과 면허번호가 보이는지 확인해 주세요."); return; }
        setPreviewReady(true);
        router.push("/onboarding/preview");
    }

    if (!draft) return <section className="rounded-2xl bg-white p-8"><h1 className="text-2xl font-bold">기본 정보를 먼저 입력해 주세요</h1><p className="mt-4 text-sm text-[#879FA7]">새로고침하면 임시 입력 내용이 초기화됩니다.</p><Link href="/onboarding" className="mt-6 inline-block text-[#168B86] underline">기본 정보 입력으로</Link></section>;

    return <>
        <DoctorOnboardingHeader step={2} title="면허증 이미지를 등록해 주세요" description="실명과 면허번호가 선명하게 보이는 이미지를 선택해 주세요." />
        <form onSubmit={next} className="rounded-2xl border border-[#DFE8E9] bg-white p-8">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-semibold">자격 증빙</h2><span className="text-sm text-[#879FA7]">{draft.doctor_name} · 면허번호 {draft.doctor_license_number}</span></div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="면허증 이미지 파일" onChange={selectImage} className="hidden" />
            {evidence ? <div className="overflow-hidden rounded-2xl border border-[#DEE8E5]">
                <div className="relative h-64 bg-[#F4F7F6]"><Image src={evidence.previewUrl} alt="선택한 면허증 이미지 미리보기" fill unoptimized sizes="800px" className="object-contain p-4" /></div>
                <div className="flex items-center justify-between gap-4 bg-white p-4"><div className="min-w-0"><p className="truncate text-sm font-medium">{evidence.file.name}</p><p className="mt-1 text-xs text-[#879FA7]">{(evidence.file.size / 1024 / 1024).toFixed(2)}MB</p></div><Button variant="ghost" aria-label="선택 이미지 삭제" onClick={() => { selectionId.current += 1; setEvidence(null); setConfirmed(false); setReading(false); setError(""); }}><Trash2 aria-hidden="true" className="size-4" />삭제</Button></div>
            </div> : <button type="button" onClick={() => fileInput.current?.click()} className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#CFDFD9] bg-[#F8FBF9] text-[#6F897C] hover:bg-[#EFF7F2] focus-visible:outline-2 focus-visible:outline-primary"><ImagePlus aria-hidden="true" className="mb-4 size-9 text-[#53A190]" /><span className="text-base font-semibold">면허증 이미지 선택</span><span className="mt-3 text-xs">JPG · PNG · WEBP / 최대 5MB</span></button>}
            {evidence && <button type="button" onClick={() => fileInput.current?.click()} className="mt-3 text-sm text-[#168B86] underline underline-offset-4">다른 이미지 선택</button>}
            {reading && <p role="status" className="mt-3 text-sm text-[#879FA7]">이미지를 확인하고 있습니다.</p>}
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 rounded-xl bg-[#F4F7F8] p-4 text-xs leading-6 text-[#7A929D]"><p>실명과 면허번호를 확인할 수 있도록 등록해 주세요.</p><p>주민등록번호 등 검토에 필요하지 않은 정보는 가려 주세요.</p><p>현재 선택한 파일은 서버에 업로드되지 않습니다.</p></div>
            <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-[#617A87]"><input type="checkbox" checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setError(""); }} className="mt-1 size-4 accent-[#168B86]" />실명과 면허번호가 보이는지 확인했습니다.</label>
            <div className="mt-8 flex justify-between gap-4"><Button variant="secondary" onClick={() => router.push("/onboarding")}><ArrowLeft aria-hidden="true" className="size-4" />이전으로</Button><Button type="submit" disabled={!evidence || !confirmed || reading || Boolean(error)}>검증 대기 화면 미리보기<ArrowRight aria-hidden="true" className="size-4" /></Button></div>
        </form>
    </>;
}
