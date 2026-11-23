"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, ShieldCheck } from "lucide-react";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Field,
  inputClass,
  LinkButton,
  PageHeader,
} from "@/components/doctor/DoctorUI";

export default function DoctorProfile() {
  const { state, updateProfile, setVerification, startDemo, notify } =
    useDoctor();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState<"logout" | "withdraw" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const profile = state.profile;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateProfile({
      ...profile,
      nickname: String(data.get("nickname")).trim(),
      phone: String(data.get("phone")).trim(),
    });
    setEditing(false);
    notify("프로필을 현재 시연 화면에 반영했습니다.");
  }
  return (
    <>
      <PageHeader
        title="내 프로필"
        description="개인 계정과 의료진 자격 정보를 확인합니다."
        action={
          <Button variant="secondary" onClick={() => setDialog("logout")}>
            <LogOut size={15} />
            로그아웃
          </Button>
        }
      />
      <div className="mb-6 flex items-center gap-5 rounded-2xl bg-[#E8F2F1] px-7 py-7">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-white text-2xl font-semibold text-[#479B8C]">
          {profile.name.slice(0, 1)}
        </span>
        <div>
          <h2 className="text-xl font-semibold">{profile.name} 의료진</h2>
          <p className="mt-2 text-sm text-[#6F9495]">
            {profile.hospital} · {profile.department}
          </p>
        </div>
        <span className="ml-auto">
          <Badge>개인 의료진 계정</Badge>
        </span>
      </div>
      <div className="grid grid-cols-2 items-start gap-6">
        <Card
          title="계정 정보"
          action={
            !editing && (
              <Button variant="ghost" onClick={() => setEditing(true)}>
                <Pencil size={14} />
                수정
              </Button>
            )
          }
        >
          {editing ? (
            <form onSubmit={submit} className="space-y-5">
              <Field label="닉네임">
                <input
                  name="nickname"
                  required
                  maxLength={40}
                  defaultValue={profile.nickname}
                  className={inputClass}
                />
              </Field>
              <Field label="휴대전화">
                <input
                  name="phone"
                  required
                  type="tel"
                  pattern="[0-9-]{10,13}"
                  defaultValue={profile.phone}
                  className={inputClass}
                />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  취소
                </Button>
                <Button type="submit">변경 저장</Button>
              </div>
            </form>
          ) : (
            <dl className="divide-y divide-[#EAF0F2]">
              {[
                ["이름", profile.name],
                ["닉네임", profile.nickname],
                ["휴대전화", profile.phone],
                ["로그인 방식", "소셜 계정 · 시연에서는 연결 전"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-5 text-sm">
                  <dt className="text-[#94A6B0]">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
        <Card
          title="자격 및 소속"
          action={<ShieldCheck size={21} className="text-[#51A18F]" />}
        >
          <dl className="divide-y divide-[#EAF0F2]">
            {[
              ["직종·전문 분야", profile.department],
              ["면허 번호", profile.license],
              ["소속 의료기관", profile.hospital],
              [
                "자격 상태",
                profile.verification === "verified"
                  ? "확인 완료 · 시연"
                  : profile.verification === "pending"
                    ? "확인 대기"
                    : "보완 요청",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-5 text-sm">
                <dt className="text-[#94A6B0]">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => {
              setVerification("revision");
              router.push("/onboarding");
            }}
          >
            자격·소속 정보 보완
          </Button>
        </Card>
      </div>
      <Card title="계정 관리" className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#79929F]">
              탈퇴 전 연결된 산모와 보관 중인 기록의 처리 기준을 확인해야
              합니다.
            </p>
            <p className="mt-2 text-xs text-[#A1AFB7]">
              실제 탈퇴·기록 보존 정책과 처리 API는 연결 전입니다.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmText("");
              setDialog("withdraw");
            }}
          >
            회원 탈퇴
          </Button>
        </div>
      </Card>
      <div className="mt-6">
        <LinkButton href="/dashboard" secondary>
          대시보드로 돌아가기
        </LinkButton>
      </div>
      {dialog && (
        <Dialog
          title={
            dialog === "logout" ? "시연 화면을 나갈까요?" : "탈퇴 흐름 확인"
          }
          onClose={() => setDialog(null)}
        >
          <p className="text-sm leading-7 text-[#8095A1]">
            {dialog === "logout"
              ? "로그인 화면으로 이동합니다. 실제 인증 세션은 연결 전이므로 서버 로그아웃은 실행하지 않습니다."
              : "현재는 실제 회원 삭제 기능이 없습니다. ‘탈퇴’를 입력하면 시연 데이터를 초기화하고 로그인 화면으로 돌아갑니다."}
          </p>
          {dialog === "withdraw" && (
            <div className="mt-5">
              <Field label="확인 문구">
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="탈퇴"
                  className={inputClass}
                />
              </Field>
            </div>
          )}
          <div className="mt-7 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDialog(null)}>
              취소
            </Button>
            <Button
              disabled={dialog === "withdraw" && confirmText !== "탈퇴"}
              onClick={() => {
                if (dialog === "withdraw") startDemo();
                notify(
                  dialog === "withdraw"
                    ? "시연 상태를 초기화했습니다. 실제 회원 삭제는 실행되지 않았습니다."
                    : "로그인 화면으로 이동합니다.",
                  "info",
                );
                setDialog(null);
                router.push("/login");
              }}
            >
              {dialog === "logout" ? "로그인 화면으로" : "시연 상태 초기화"}
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
