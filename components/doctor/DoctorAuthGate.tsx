"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  DoctorAuthError,
  getDoctorSessionApi,
} from "@/api/auth/doctor-auth.api";
import { useDoctor } from "./DoctorProvider";

// 프론트 이동 제어입니다. 실제 데이터 API에서도 의료진 세션·승인·산모 연결을 검사해야 합니다.
export default function DoctorAuthGate({
  children,
  requireVerified = true,
}: {
  children: ReactNode;
  requireVerified?: boolean;
}) {
  const router = useRouter();
  const { updateProfile } = useDoctor();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const checkAuthApi = async () => {
      try {
        const result = await getDoctorSessionApi(controller.signal);
        if (controller.signal.aborted) return;
        const doctor = result.data;
        if (!doctor)
          throw new DoctorAuthError(502, "의료진 정보를 확인하지 못했습니다.");
        if (requireVerified && !doctor.doctor_verification_status) {
          router.replace("/verification");
          return;
        }
        updateProfile({
          id: doctor.id,
          name: doctor.doctor_name,
          nickname: doctor.doctor_name,
          phone: doctor.doctor_phone,
          hospital: doctor.doctor_hospital,
          department: doctor.doctor_profession,
          license: doctor.doctor_license_number ?? "",
          verification: doctor.doctor_verification_status
            ? "verified"
            : "pending",
        });
        setReady(true);
      } catch (cause) {
        if (controller.signal.aborted) return;
        if (
          cause instanceof DoctorAuthError &&
          [401, 403].includes(cause.status)
        ) {
          router.replace("/login");
          return;
        }
        setError(
          "로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    };

    checkAuthApi();
    return () => controller.abort();
  }, [router, requireVerified, updateProfile, attempt]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#F4F7F9] p-12 text-center text-[#617A87]">
        <p role="alert">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError("");
            setAttempt((value) => value + 1);
          }}
          className="mt-5 rounded-xl bg-white px-5 py-3"
        >
          다시 시도
        </button>
      </main>
    );
  }
  if (!ready)
    return (
      <main
        role="status"
        className="min-h-screen bg-[#F4F7F9] p-12 text-center text-[#617A87]"
      >
        로그인 상태를 확인하고 있습니다.
      </main>
    );
  return children;
}
