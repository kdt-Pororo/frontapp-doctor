import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pretendard } from "@/styles/font/font";
import { DoctorProvider } from "@/components/doctor/DoctorProvider";
import "./globals.css";

export const metadata: Metadata = {
    title: { default: "NESTEP 의료진", template: "%s | NESTEP 의료진" },
    description: "NESTEP 의료진 전용 웹",
    icons: { icon: "/icons/nestep_main_icon.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="ko" className={`${pretendard.variable} font-pretendard [scrollbar-gutter:stable]`}>
            <body className="min-w-330 font-pretendard">
                <DoctorProvider>{children}</DoctorProvider>
            </body>
        </html>
    );
}
