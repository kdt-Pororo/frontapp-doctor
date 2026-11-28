export type DoctorSocialProvider = "kakao" | "naver" | "google";

// 백엔드 doctor_auth_schema.py와 같은 필드명을 사용합니다.
export interface DoctorPendingDTO {
    doctor_provider: string;
    doctor_provider_id: string;
    doctor_email: string | null;
}

export interface DoctorSessionDTO {
    id: number;
    doctor_name: string;
    doctor_phone: string;
    doctor_profession: string;
    doctor_hospital: string;
    doctor_verification_status: boolean;
    verification_status: "APPROVED" | "PENDING" | "REJECTED";
    doctor_license_number: string | null;
    doctor_email: string | null;
    hospital_id: number | null;
    doctor_rejection_reason: string | null;
    doctor_submitted_at: string | null;
}

export interface DoctorApplicationContextDTO {
    identity: DoctorPendingDTO;
    profile: DoctorSessionDTO | null;
}

export interface DoctorHospitalDTO {
    id: number;
    hospital_name: string;
    hospital_address: string;
}
