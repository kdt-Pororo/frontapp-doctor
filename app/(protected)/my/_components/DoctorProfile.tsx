"use client";

import { useRouter } from "next/navigation";
import { logoutDoctorApi } from "@/api/auth/doctor-auth.api";
import { useDoctor } from "@/components/doctor/DoctorProvider";
import { Badge, Button, Card, PageHeader } from "@/components/doctor/DoctorUI";

export default function DoctorProfile() {
  const {
    state: { profile },
    notify,
  } = useDoctor();
  const router = useRouter();
  async function logout() {
    try {
      await logoutDoctorApi();
      router.replace("/login");
    } catch {
      notify("로그아웃하지 못했습니다. 다시 시도해 주세요.", "error");
    }
  }
  return (
    <>
      <PageHeader
        title="내 프로필"
        description="현재 로그인한 의료진의 등록 정보를 확인합니다."
        action={
          <Button variant="secondary" onClick={logout}>
            로그아웃
          </Button>
        }
      />
      <Card title="의료진 정보" action={<Badge>자격 승인 완료</Badge>}>
        <dl className="grid grid-cols-[140px_1fr] gap-y-6 text-sm">
          {[
            ["이름", profile.name],
            ["소속 병원", profile.hospital],
            ["연락처", profile.phone],
            ["면허번호", profile.license],
          ].map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-[#8297A2]">{label}</dt>
              <dd>{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </>
  );
}
