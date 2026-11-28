import type { ApiResponseDTO } from "@/types/common/common.type";
import type { DoctorPendingDTO, DoctorSessionDTO, DoctorSocialProvider, DoctorApplicationContextDTO, DoctorHospitalDTO } from "@/types/auth/doctor-auth.type";
import type { DoctorAdditionalFormValues } from "@/types/auth/doctor-onboarding.type";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");
export const isDoctorAuthConfigured = Boolean(BACKEND_URL);

export class DoctorAuthError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "DoctorAuthError";
    }
}

function endpoint(path: string) {
    if (!BACKEND_URL) {
        throw new DoctorAuthError(503, "로그인 연결을 준비하고 있습니다.");
    }
    return `${BACKEND_URL}/doctors/auth${path}`;
}

export function doctorLoginUrl(provider: DoctorSocialProvider) {
    return endpoint(`/${provider}`);
}

// 쿠키 인증과 공통 응답 처리를 모읍니다. 화면에서는 data를 꺼내 사용합니다.
async function request<T>(path: string, method = "GET", signal?: AbortSignal, payload?: FormData): Promise<ApiResponseDTO<T>> {
    const response = await fetch(endpoint(path), {
        method,
        credentials: "include",
        cache: "no-store",
        signal,
        body: payload,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = typeof body?.detail === "string" ? body.detail : "로그인 정보를 확인하지 못했습니다.";
        throw new DoctorAuthError(response.status, message);
    }
    if (!body || body.success !== true || !("data" in body)) {
        throw new DoctorAuthError(502, "로그인 응답을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
    return body as ApiResponseDTO<T>;
}

export const getDoctorSessionApi = async (signal?: AbortSignal): Promise<ApiResponseDTO<DoctorSessionDTO>> => {
    return request<DoctorSessionDTO>("/session", "GET", signal);
};

export const getDoctorPendingApi = async (signal?: AbortSignal): Promise<ApiResponseDTO<DoctorPendingDTO>> => {
    return request<DoctorPendingDTO>("/pending", "GET", signal);
};

export const cancelDoctorPendingApi = async (): Promise<ApiResponseDTO> => {
    return request("/pending/cancel", "POST");
};

export const logoutDoctorApi = async (): Promise<ApiResponseDTO> => {
    return request("/logout", "POST");
};

export const getDoctorApplicationApi = (signal?: AbortSignal): Promise<ApiResponseDTO<DoctorApplicationContextDTO>> => request("/application", "GET", signal);

export const searchDoctorHospitalsApi = (query: string, signal?: AbortSignal): Promise<ApiResponseDTO<DoctorHospitalDTO[]>> => request(`/hospitals?query=${encodeURIComponent(query)}`, "GET", signal);

export function submitDoctorApplicationApi(values: DoctorAdditionalFormValues, file: File): Promise<ApiResponseDTO> {
    const body = new FormData();
    body.set("application", JSON.stringify({
        doctor_name: values.doctor_name, doctor_email: values.doctor_email,
        doctor_phone: values.doctor_phone, hospital_id: values.hospital_id,
        doctor_license_number: values.doctor_license_number,
        confirmed_information: values.confirmed_information, confirmed_evidence: true,
    }));
    body.set("file", file);
    return request("/apply", "POST", undefined, body);
}
