import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowUpRight, ShieldCheck, Activity } from "lucide-react";

export default function DoctorAuthFrame({
  children,
  login = false,
}: {
  children: ReactNode;
  login?: boolean;
}) {
  const logo = (
    <Link
      href="/login"
      className="inline-flex items-center gap-2.5 text-xl font-bold tracking-wide"
    >
      <Image
        src="/icons/nestep_main_icon.png"
        width={31}
        height={31}
        alt=""
        className="h-auto "
      />
      NESTEP
      <span className="ml-2 border-l border-current/20 pl-3 text-xs font-normal tracking-normal opacity-60">
        의료진 포털
      </span>
    </Link>
  );
  if (!login)
    return (
      <div className="min-h-screen min-w-330 bg-[#F3F7F9] font-pretendard text-[#254450]">
        <header className="border-b border-[#E1E9ED] bg-white px-12 py-6">
          {logo}
        </header>
        <main className="mx-auto max-w-6xl px-8 py-12">{children}</main>
        <p className="pb-8 text-center text-xs text-[#9AABB5]">
          의료진 자격 확인이 완료되면 산모 관리 기능을 이용할 수 있습니다.
        </p>
      </div>
    );
  return (
    <div className="grid min-h-screen min-w-330 grid-cols-[44%_56%] font-pretendard">
      <aside className="relative flex min-h-screen flex-col overflow-hidden bg-[#122E3D] px-16 py-12 text-white">
        <div className="relative z-10">{logo}</div>
        <div className="relative z-10 my-auto py-20">
          <p className="text-xs font-semibold tracking-[0.22em] text-[#76C6B8]">
            CARE, CONNECTED.
          </p>
          <h1 className="mt-7 text-[44px] font-semibold leading-normal tracking-tight">
            한 번의 연결로,
            <br />
            이어지는 산모 케어.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-8 text-[#97B0BD]">
            검진 기록부터 다음 방문, 시간에 따른 변화까지.
            <br />
            담당 산모의 흐름을 한 곳에서 확인하세요.
          </p>
          <div className="mt-12 flex gap-6 text-xs text-[#A9C2C9]">
            <span className="flex items-center gap-2">
              <ShieldCheck size={17} />
              개인 의료진 계정
            </span>
            <span className="flex items-center gap-2">
              <Activity size={17} />
              연속적인 기록 관리
            </span>
          </div>
        </div>
        <div className="absolute -bottom-44 -right-32 rounded-full border border-[#397B82]/25" />
        <div className="absolute -bottom-24 -right-12 rounded-full border border-[#397B82]/20" />
        <p className="relative z-10 text-[11px] text-[#62818E]">
          NESTEP · 의료진 전용 워크스페이스
        </p>
      </aside>
      <main className="flex flex-col bg-white px-20 py-12 text-[#284653]">
        <Link
          href={process.env.NEXT_PUBLIC_USER_WEB_URL || "http://localhost:3000"}
          className="ml-auto inline-flex items-center gap-1 text-xs text-[#9BAAB4]"
        >
          일반 사용자 웹으로
          <ArrowUpRight size={14} />
        </Link>
        <div className="mx-auto my-auto w-full  py-14">
          {children}
        </div>
        <p className="text-center text-xs text-[#A8B4BB]">
          NESTEP 의료진 전용 서비스
        </p>
      </main>
    </div>
  );
}
