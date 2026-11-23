"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, FileCheck2, ArrowRight } from "lucide-react";
import DoctorAuthFrame from "@/components/doctor/DoctorAuthFrame";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
    Button,
    Card,
    Dialog,
    Field,
    inputClass,
} from "@/components/doctor/DoctorUI";

export default function DoctorOnboarding() {
    const { state, updateProfile, notify } = useDoctor();
    const router = useRouter();
    const [cancel, setCancel] = useState(false);
    const [phone, setPhone] = useState("");
    const [sentPhone, setSentPhone] = useState("");
    const [verifiedPhone, setVerifiedPhone] = useState("");
    const [code, setCode] = useState("");
    const [fileName, setFileName] = useState("");
    const revising = state.profile.verification === "revision";
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (verifiedPhone !== phone || !phone) {
            notify("휴대전화 확인 시연을 완료해 주세요.", "error");
            return;
        }
        if (!fileName) {
            notify("자격 증빙 파일을 선택해 주세요.", "error");
            return;
        }
        const data = new FormData(event.currentTarget);
        const value = (key: string) => String(data.get(key) ?? "").trim();
        updateProfile({
            name: value("name"),
            nickname: value("nickname"),
            phone,
            hospital: value("hospital"),
            department: value("department"),
            license: value("license"),
            verification: "pending",
        });
        notify(
            "정보를 시연 상태에 반영했습니다. 실제 회원 DB 저장과 파일 전송은 하지 않습니다.",
            "info",
        );
        router.push("/verification");
    }
    return (
        <DoctorAuthFrame>
            <div className="mb-9">
                <p className="text-xs font-semibold tracking-widest text-[#58A296]">
                    GET STARTED
                </p>
                <h1 className="mt-3 text-3xl font-bold">의료진으로 시작하기</h1>
                <p className="mt-3 text-sm text-[#8FA2AC]">
                    계정 정보와 자격 증빙을 한 번에 입력합니다.
                </p>
                <div className="mt-7 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-2 text-[#168B86]">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#DAEEE9]">
                            1
                        </span>
                        정보·자격 입력
                    </span>
                    <span className="h-px w-12 bg-[#D7E2E7]" />
                    <span className="flex items-center gap-2 text-[#A4B2BC]">
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#E6EDF1]">
                            2
                        </span>
                        검증 상태 확인
                    </span>
                </div>
            </div>
            <form onSubmit={submit} className="space-y-6">
                <Card title="기본 정보">
                    <div className="grid grid-cols-2 gap-5">
                        <Field label="실명 *">
                            <input
                                name="name"
                                required
                                maxLength={40}
                                defaultValue={
                                    revising ? state.profile.name : ""
                                }
                                placeholder="이름"
                                className={inputClass}
                            />
                        </Field>
                        <Field label="닉네임 *">
                            <input
                                name="nickname"
                                required
                                maxLength={40}
                                defaultValue={
                                    revising ? state.profile.nickname : ""
                                }
                                placeholder="표시할 닉네임"
                                className={inputClass}
                            />
                        </Field>
                        <div className="col-span-2">
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <Field label="휴대전화 *">
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            pattern="[0-9-]{10,13}"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            placeholder="010-0000-0000"
                                            className={inputClass}
                                        />
                                    </Field>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        if (
                                            !/^01[0-9][0-9-]{7,10}$/.test(phone)
                                        ) {
                                            notify(
                                                "휴대전화 번호를 확인해 주세요.",
                                                "error",
                                            );
                                            return;
                                        }
                                        setSentPhone(phone);
                                        notify(
                                            "문자는 발송되지 않습니다. 시연 확인 코드: 123456",
                                            "info",
                                        );
                                    }}>
                                    확인 코드 시연
                                </Button>
                            </div>
                            {sentPhone && (
                                <div className="mt-3 flex gap-3">
                                    <input
                                        aria-label="시연 확인 코드"
                                        inputMode="numeric"
                                        placeholder="시연 코드 123456"
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value)
                                        }
                                        className={inputClass}
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            if (
                                                code === "123456" &&
                                                sentPhone === phone
                                            ) {
                                                setVerifiedPhone(phone);
                                                notify(
                                                    "휴대전화 확인 흐름을 시연했습니다.",
                                                );
                                            } else
                                                notify(
                                                    "전화번호와 시연 코드 123456을 확인해 주세요.",
                                                    "error",
                                                );
                                        }}>
                                        {verifiedPhone === phone ? (
                                            <>
                                                <Check size={15} />
                                                확인됨
                                            </>
                                        ) : (
                                            "코드 확인"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
                <Card
                    title="의료진 자격 정보"
                    action={
                        <FileCheck2 size={20} className="text-[#65A697]" />
                    }>
                    <div className="grid grid-cols-2 gap-5">
                        <Field label="직종·전문 분야 *">
                            <input
                                name="department"
                                required
                                defaultValue={
                                    revising ? state.profile.department : ""
                                }
                                placeholder="예: 산부인과 전문의"
                                className={inputClass}
                            />
                        </Field>
                        <Field label="면허 번호 *">
                            <input
                                name="license"
                                required
                                maxLength={100}
                                defaultValue={
                                    revising ? state.profile.license : ""
                                }
                                placeholder="면허 번호"
                                className={inputClass}
                            />
                        </Field>
                        <div className="col-span-2">
                            <Field label="소속 의료기관 *">
                                <input
                                    name="hospital"
                                    required
                                    defaultValue={
                                        revising ? state.profile.hospital : ""
                                    }
                                    placeholder="소속 의료기관명"
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                        <div className="col-span-2">
                            <Field
                                label="면허·재직 증빙 파일 *"
                                hint="PDF, PNG, JPG · 10MB 이하. 시연에서는 파일명만 확인하며 업로드하지 않습니다.">
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    required
                                    className={`${inputClass} file:mr-4 file:rounded-md file:border-0 file:bg-[#EAF4F1] file:px-3 file:py-1 file:text-xs file:text-[#3A8C7E]`}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (
                                            file &&
                                            (file.size > 10 * 1024 * 1024 ||
                                                !/\.(pdf|png|jpe?g)$/i.test(
                                                    file.name,
                                                ))
                                        ) {
                                            e.target.value = "";
                                            setFileName("");
                                            notify(
                                                "허용된 파일 형식과 10MB 용량을 확인해 주세요.",
                                                "error",
                                            );
                                            return;
                                        }
                                        setFileName(file?.name ?? "");
                                    }}
                                />
                            </Field>
                        </div>
                    </div>
                </Card>
                <Card title="필수 동의">
                    <div className="space-y-4">
                        {[
                            "서비스 이용약관에 동의합니다.",
                            "개인정보 수집 및 이용에 동의합니다.",
                            "의료진 자격 증빙 정보 처리에 동의합니다.",
                        ].map((text) => (
                            <label
                                key={text}
                                className="flex items-center gap-3 text-sm text-[#7B929D]">
                                <input
                                    type="checkbox"
                                    required
                                    className="size-4 accent-[#168B86]"
                                />
                                {text}
                                <span className="text-xs text-[#A6B4BC]">
                                    필수
                                </span>
                            </label>
                        ))}
                    </div>
                    <p className="mt-5 text-xs leading-6 text-[#A0AFB7]">
                        약관 전문과 실제 동의 저장은 회원 API 연동 시 연결할
                        예정입니다.
                    </p>
                </Card>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setCancel(true)}>
                        취소
                    </Button>
                    <Button type="submit">
                        검증 신청 시연
                        <ArrowRight size={16} />
                    </Button>
                </div>
            </form>
            {cancel && (
                <Dialog
                    title="입력을 취소할까요?"
                    onClose={() => setCancel(false)}>
                    <p className="text-sm leading-7 text-[#8297A3]">
                        작성 중인 내용은 저장되지 않습니다. 소셜 인증 후 실제
                        회원을 생성하는 기능도 아직 연결하지 않았습니다.
                    </p>
                    <div className="mt-7 flex justify-end gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setCancel(false)}>
                            계속 입력
                        </Button>
                        <Button onClick={() => router.push("/login")}>
                            입력 취소
                        </Button>
                    </div>
                </Dialog>
            )}
        </DoctorAuthFrame>
    );
}
