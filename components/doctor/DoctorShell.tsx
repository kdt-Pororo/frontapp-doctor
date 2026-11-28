"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutDoctorApi } from "@/api/auth/doctor-auth.api";
import {
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
  Link2,
  LogOut,
  Settings2,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { useDoctor } from "./DoctorProvider";
import { Badge, Card, LinkButton } from "./DoctorUI";

const links = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "담당 산모", href: "/patients", icon: UsersRound },
  { label: "산모 연결", href: "/patients/connect", icon: Link2 },
  { label: "내 프로필", href: "/my", icon: Settings2 },
];

export default function DoctorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, notify } = useDoctor();
  const router = useRouter();
  async function logout() {
    try { await logoutDoctorApi(); router.replace("/login"); }
    catch { notify("로그아웃하지 못했습니다. 다시 시도해 주세요.", "error"); }
  }
  const active = pathname.includes("/connect")
    ? "/patients/connect"
    : pathname.includes("/patients")
      ? "/patients"
      : pathname.includes("/my")
        ? "/my"
        : "/dashboard";
  const title = pathname.includes("/records/new")
    ? "검진·일정 입력"
    : pathname.includes("/risks")
      ? "위험도 추이"
      : pathname.includes("/end-request")
        ? "임신 관리 종료"
        : pathname.includes("/records")
          ? "기록 조회"
          : links.find((item) => item.href === active)?.label;

  if (state.profile.verification !== "verified")
    return (
      <main className="min-h-screen bg-[#F4F7F9] px-8 py-20 text-center">
        <Card title="의료진 자격 확인이 필요합니다">
          <p className="mb-6 text-sm text-[#8A9BA5]">
            자격 확인 완료 상태에서 산모와 진료 화면을 이용할 수 있습니다.
            현재는 프론트 시연입니다.
          </p>
          <LinkButton href="/verification">인증 상태 확인</LinkButton>
        </Card>
      </main>
    );

  return (
    <div className="grid min-h-screen min-w-330 grid-cols-[240px_minmax(0,1fr)] bg-[#F4F7F9] font-pretendard text-[#294451]">
      <aside className="sticky top-0 flex h-screen flex-col bg-[#122E3D] px-5 py-7 text-white">
        <Link
          href="/dashboard"
          className="mb-12 flex items-center gap-2.5 px-3 text-[23px] font-bold tracking-wide"
        >
          <Image
            src="/icons/nestep_main_icon.png"
            width={553}
            height={513}
            sizes="30px"
            alt=""
            className="h-auto w-7.5"
          />
          NESTEP
        </Link>
        <p className="mb-4 px-4 text-[10px] font-semibold tracking-[0.16em] text-[#64808F]">
          의료진 워크스페이스
        </p>
        <nav aria-label="의료진 메뉴" className="space-y-2">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active === href ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors ${active === href ? "bg-[#204653] text-[#D6F5ED]" : "text-[#8CA7B5] hover:bg-[#1B3C4B] hover:text-white"}`}
            >
              <Icon size={18} />
              {label}
              {active === href && (
                <span className="ml-auto size-1.5 rounded-full bg-[#52C6B6]" />
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-9 rounded-xl border border-[#2A4957] bg-[#173746] p-4">
          <p className="text-xs font-semibold text-[#9CBBC4]">
            함께 기록하는 진료
          </p>
          <p className="mt-2 text-xs leading-6 text-[#668895]">
            산모의 일상 기록부터
            <br />
            검진 이후의 변화까지.
          </p>
          <Link
            href="/patients/connect"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#61C5B9]"
          >
            새로운 산모 연결
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="mt-auto border-t border-[#294755] px-3 pt-6">
          <Link href="/my" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#274653] font-semibold text-[#A1C5CC]">
              {state.profile.name.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm font-semibold">
                {state.profile.name} 의료진
              </p>
              <p className="mt-1 text-[11px] text-[#7894A2]">
                {state.profile.hospital}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="mt-5 flex items-center gap-2 text-xs text-[#7894A2]"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex  items-center justify-between border-b border-[#E6EDF0] bg-white/95 px-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-[#9BAAB3]">
            <span>NESTEP</span>
            <ChevronRight size={12} />
            <span>의료진 포털</span>
            <ChevronRight size={12} />
            <span className="font-medium text-[#58727F]">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#9BAAB3]">
              프론트 시연 · 새로고침 시 초기화
            </span>
            <Badge tone="neutral">샘플 데이터</Badge>
            <Link
              href="/my"
              aria-label="내 프로필"
              className="flex size-9 items-center justify-center rounded-full border border-[#DCE8E7] bg-[#F1F8F6] text-xs font-semibold text-[#468C7C]"
            >
              {state.profile.name.slice(0, 1)}
            </Link>
          </div>
        </header>
        <main className="mx-auto  px-8 pb-14 pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
