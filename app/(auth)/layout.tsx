import { Suspense, type ReactNode } from "react";

// 로그인·추가 정보·자격 확인 화면은 의료진 사이드바 없이 표시합니다.
export default function AuthLayout({ children }: { children: ReactNode }) {
    return <Suspense fallback={null}>{children}</Suspense>;
}
