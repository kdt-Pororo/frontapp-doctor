import { Check } from "lucide-react";

const steps = ["기본 정보", "면허증 등록", "검증 대기"];

export default function DoctorOnboardingHeader({ step, title, description }: { step: number; title: string; description: string }) {
    return <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest text-[#58A296]">CLINICIAN REGISTRATION</p>
        <h1 className="mt-3 text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-base leading-7 text-[#879FA7]">{description}</p>
        <ol aria-label="의료진 가입 단계" className="mt-7 flex items-center gap-7 border-b border-[#DCE6E7] pb-6">
            {steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={`flex items-center gap-2 text-sm ${step >= index + 1 ? "font-semibold text-[#168B86]" : "text-[#A2B1B8]"}`}><span className={`flex size-7 items-center justify-center rounded-full ${step >= index + 1 ? "bg-[#E0F2EC]" : "bg-[#EDF2F4]"}`}>{step > index + 1 ? <Check aria-hidden="true" className="size-4" /> : index + 1}</span>{label}</li>)}
        </ol>
        <p className="mt-4 text-sm leading-6 text-[#879FA7]">면허증 등록 단계에서 최종 제출하면 가입 정보와 면허증이 저장됩니다.</p>
    </div>;
}
