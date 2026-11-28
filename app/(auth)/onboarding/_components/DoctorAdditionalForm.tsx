"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/doctor/DoctorUI";
import type { DoctorAdditionalFormValues } from "@/types/auth/doctor-onboarding.type";
import { useDoctorOnboarding } from "./DoctorOnboardingProvider";
import DoctorOnboardingHeader from "./DoctorOnboardingHeader";
import DoctorOnboardingCancel from "./DoctorOnboardingCancel";
import HospitalSelect from "./HospitalSelect";

const fields = [
    { name: "doctor_name", label: "실명", placeholder: "면허증에 기재된 실명", max: 40, autoComplete: "name" },
    { name: "doctor_phone", label: "연락처", placeholder: "010-0000-0000", max: 20, autoComplete: "tel" },
    { name: "doctor_license_number", label: "면허번호", placeholder: "면허증에 기재된 번호", max: 100, autoComplete: "off" },
] as const;

// 가입 입력 화면만 크게 표시합니다. 다른 페이지의 공통 입력 스타일은 유지합니다.
const onboardingInputClass = "h-13 w-full rounded-xl border border-[#DCE5E9] bg-white px-4 text-base text-[#203B48] outline-none placeholder:text-[#A1AFB7] focus:border-[#188D88] focus:ring-2 focus:ring-[#188D88]/10 read-only:bg-[#F4F7F8]";

export default function DoctorAdditionalForm() {
    const router = useRouter();
    const { identity, draft, setDraft } = useDoctorOnboarding();
    const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<DoctorAdditionalFormValues>({
        mode: "onTouched",
        defaultValues: draft ?? { doctor_name: "", doctor_email: identity.doctor_email ?? "", doctor_phone: "", doctor_hospital: "", hospital_id: null, doctor_license_number: "", confirmed_information: false },
    });
    const [hospitalName, hospitalId] = useWatch({control, name: ["doctor_hospital", "hospital_id"]});

    function onSubmit(values: DoctorAdditionalFormValues) {
        // 다음 화면으로 전달만 합니다. 가입 API와 이미지 전송은 아직 호출하지 않습니다.
        setDraft(values);
        router.push("/onboarding/license");
    }

    return <>
        <DoctorOnboardingHeader step={1} title="의료진 정보를 입력해 주세요" description="면허증에 기재된 정보와 동일하게 입력해 주세요." />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl border border-[#DFE8E9] bg-white p-10">
            <div className="mb-8 flex items-center justify-between border-b border-[#E6ECEE] pb-6"><h2 className="text-xl font-semibold">기본 정보</h2><span className="text-sm text-[#879FA7]">{identity.doctor_provider} 계정</span></div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-7">
                <div className="col-span-2">
                    <label htmlFor="doctor_email" className="mb-3 block text-base font-medium">이메일 <span className="text-[#168B86]">*</span></label>
                    <input id="doctor_email" type="email" readOnly={Boolean(identity.doctor_email)} autoComplete="email" aria-invalid={Boolean(errors.doctor_email)} aria-describedby={errors.doctor_email ? "doctor_email_error" : undefined} className={onboardingInputClass} {...register("doctor_email", { required: "이메일을 입력해 주세요.", maxLength: { value: 255, message: "255자 이내로 입력해 주세요." }, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "이메일 형식을 확인해 주세요." } })} />
                    {errors.doctor_email && <p id="doctor_email_error" role="alert" className="mt-2 text-xs text-red-600">{errors.doctor_email.message}</p>}
                </div>
                {fields.map((field) => <div key={field.name}>
                    <label htmlFor={field.name} className="mb-3 block text-base font-medium">{field.label} <span className="text-[#168B86]">*</span></label>
                    <input id={field.name} type={field.name === "doctor_phone" ? "tel" : "text"} placeholder={field.placeholder} maxLength={field.max} autoComplete={field.autoComplete} aria-invalid={Boolean(errors[field.name])} aria-describedby={errors[field.name] ? `${field.name}_error` : undefined} className={onboardingInputClass} {...register(field.name, {
                        required: `${field.label}를 입력해 주세요.`,
                        setValueAs: (value: string) => value.trim(),
                        maxLength: { value: field.max, message: `${field.max}자 이내로 입력해 주세요.` },
                        validate: field.name === "doctor_phone" ? (value) => /^(?:0\d{8,10}|\+\d{8,15})$/.test(value.replace(/[\s-]/g, "")) || "연락처 형식을 확인해 주세요." : undefined,
                    })} />
                    {errors[field.name] && <p id={`${field.name}_error`} role="alert" className="mt-2 text-xs text-red-600">{errors[field.name]?.message}</p>}
                </div>)}
                <div>
                    <label htmlFor="doctor_hospital" className="mb-3 block text-base font-medium">소속 병원 <span className="text-[#168B86]">*</span></label>
                    <input type="hidden" {...register("hospital_id", {validate: (value) => (value !== null && value > 0) || "검색 결과에서 병원을 선택해 주세요."})} />
                    <HospitalSelect name={hospitalName} selectedId={hospitalId} invalid={Boolean(errors.hospital_id)} inputClass={onboardingInputClass}
                        onChange={(id, name) => {setValue("hospital_id", id, {shouldValidate: true});setValue("doctor_hospital", name);}} />
                    {errors.hospital_id && <p role="alert" className="mt-2 text-xs text-red-600">{errors.hospital_id.message}</p>}
                </div>
            </div>
            <label className="mt-8 flex items-start gap-3 text-base leading-7 text-[#617A87]"><input type="checkbox" className="mt-1 size-5 accent-[#168B86]" {...register("confirmed_information", { required: "본인 정보 여부를 확인해 주세요." })} />입력한 내용이 본인의 의료진 정보임을 확인합니다.</label>
            {errors.confirmed_information && <p role="alert" className="mt-2 text-xs text-red-600">{errors.confirmed_information.message}</p>}
            <div className="mt-8 flex items-start justify-between gap-4"><DoctorOnboardingCancel /><Button type="submit" disabled={isSubmitting}>다음 · 면허증 등록<ArrowRight aria-hidden="true" className="size-4" /></Button></div>
        </form>
    </>;
}
