import { DoctorAuthError } from "@/api/auth/doctor-auth.api";
import type { DoctorConnectionsDTO } from "@/types/doctor/doctor-patient.type";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");

export async function doctorWorkspaceRequest<T>(
  path: string,
  method = "GET",
  data?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  if (!BACKEND) throw new Error("백엔드 주소 설정이 필요합니다.");
  // 의료진 세션 쿠키 경로 안에서 호출합니다. 의료진 ID는 서버 세션에서 결정합니다.
  const response = await fetch(`${BACKEND}/doctors/auth/workspace${path}`, {
    method,
    credentials: "include",
    cache: "no-store",
    signal,
    ...(data === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new DoctorAuthError(
      response.status,
      typeof body?.detail === "string"
        ? body.detail
        : typeof body?.detail?.[0]?.msg === "string"
          ? body.detail[0].msg.replace(/^Value error, /, "")
          : "요청을 처리하지 못했습니다.",
    );
  if (!body?.success) throw new Error("연결 응답을 확인하지 못했습니다.");
  return body.data;
}

export const getDoctorConnectionsApi = (signal?: AbortSignal) =>
  doctorWorkspaceRequest<DoctorConnectionsDTO>(
    "/connections",
    "GET",
    undefined,
    signal,
  );
export const decideCareRequestApi = (
  id: number,
  decision: "APPROVED" | "REJECTED",
) => doctorWorkspaceRequest(`/requests/${id}/decision`, "POST", { decision });
